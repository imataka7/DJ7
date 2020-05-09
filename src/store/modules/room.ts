import {
  VuexModule, Mutation, Action, Module, getModule,
} from 'vuex-module-decorators';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { app as firebaseApp } from '@/plugins/firebase';
import store from '..';
import {
  Room, RoomUser, Musicx, PlayerStatus, AdminUser, Government,
} from '@/models';

const firestore = firebaseApp.firestore();
const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Module({
  name: 'room', namespaced: true, store, dynamic: true,
})
class RoomManager extends VuexModule {
  public roomId = '';

  public status: Room | null = null;

  public listener: (() => void) | null = null;

  get player() {
    return this.status?.player;
  }

  get queues() {
    return this.status?.queues;
  }

  get users() {
    return this.status?.users;
  }

  get adminUsers() {
    return this.status?.adminUsers || [];
  }

  get government() {
    return this.status?.government || 'anarchism';
  }

  get isMonarchism() {
    return this.government === 'monarchism';
  }

  get roomRef() {
    if (!this.roomId) {
      return null;
    }

    return firestore.collection('rooms').doc(this.roomId);
  }

  @Mutation
  public setRoomId(roomId: string) {
    this.roomId = roomId;
  }

  @Mutation
  public setStatus(status: Room) {
    this.status = status;
  }

  @Mutation
  public setListener(listener: () => void) {
    this.listener = listener;
  }

  @Action({ commit: 'setStatus', rawError: true })
  public async addRoom() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const pilgrimId: string | null = params.get('pilgrimId');
    const adminUsers = pilgrimId ? [{
      uid: pilgrimId, roleTags: ['managePlay', 'manageUser'],
    }] : [];
    const government: Government = pilgrimId ? 'monarchism' : null;

    const initial = {
      player: {
        music: null,
        playedTime: 0,
        status: PlayerStatus.NO_MUSIC,
        updatedAt: store.getters['date/now'](),
      },
      queues: [],
      roomId: this.roomId,
      users: [],
      adminUsers,
      government,
    };
    await this.roomRef!.set(initial);
    return initial;
  }

  @Action({ rawError: true })
  public async addUser(user: RoomUser) {
    if (!this.roomRef) {
      return;
    }

    const batch = firestore.batch();

    if (this.users?.find(u => u.uid === user.uid)) {
      batch.update(this.roomRef, {
        users: arrayRemove(user),
      });
    }

    batch.update(this.roomRef, {
      users: arrayUnion(user),
    });

    await batch.commit();
  }

  @Action({ rawError: true })
  public async removeUser(user: RoomUser) {
    await this.roomRef!.update({
      users: arrayRemove(user),
    });
  }

  @Action({ rawError: true })
  public async init(roomId: string) {
    this.listener?.();

    this.setRoomId(roomId);

    const snapshot = await this.roomRef!.get();

    if (!snapshot.exists) {
      await this.addRoom();
    } else {
      this.setStatus(snapshot.data() as Room);
    }

    const listener = this.roomRef!.onSnapshot(async doc => this.setStatus(doc.data() as Room));
    this.setListener(listener);
  }

  @Action({ rawError: true })
  public async updateQueue(queues: Musicx[]) {
    this.roomRef!.update({
      queues,
    });
  }

  @Action({ rawError: true })
  public async updateAdminUsers(adminUsers: AdminUser[]) {
    this.roomRef!.update({
      adminUsers,
    });
  }

  @Action({ rawError: true })
  public async changeState(payload: { status: PlayerStatus; playedTime: number }) {
    const { status, playedTime } = payload;

    if (!this.status) {
      return;
    }

    if (status === this.status.player.status
      || this.status.player.status === PlayerStatus.NO_MUSIC) {
      return;
    }

    this.roomRef!.update({
      'player.status': status,
      'player.playedTime': playedTime,
      'player.updatedAt': store.getters['date/now'](),
    });
  }

  @Action({ rawError: true })
  public async seek(to: number) {
    this.roomRef!.update({
      'player.playedTime': to,
      'player.updatedAt': store.getters['date/now'](),
    });
  }

  @Action({ rawError: true })
  public updatePlayingSpeed(s: number) {
    return this.roomRef!.update({
      'player.playingSpeed': s,
    });
  }

  @Action({ rawError: true })
  public async queueMusic(items: Musicx[]) {
    if (!this.status) {
      return;
    }

    const batch = firestore.batch();

    if (this.status.player.status === PlayerStatus.NO_MUSIC) {
      const nextMusic = items[0];

      batch.update(this.roomRef!, {
        'player.status': PlayerStatus.PLAY,
        'player.music': nextMusic,
        'player.updatedAt': nextMusic.extraStatus?.playedTime || store.getters['date/now'](),
      });

      if (items.length === 1) {
        await batch.commit();
        return;
      }

      items.shift();
    }

    batch.update(this.roomRef!, {
      queues: arrayUnion(...items),
    });

    await batch.commit();
  }

  @Action({ rawError: true })
  public async setMusicFromQueue(queues: Musicx[]) {
    if (queues.length === 0) {
      await this.roomRef!.update({
        player: {
          music: null,
          playedTime: 0,
          status: PlayerStatus.NO_MUSIC,
          updatedAt: store.getters['date/now'](),
        },
      });

      return;
    }

    const nextMusic = queues[0];
    queues.shift();

    await this.roomRef!.update({
      player: {
        music: nextMusic,
        playedTime: nextMusic.extraStatus?.playedTime || 0,
        status: PlayerStatus.PLAY,
        updatedAt: store.getters['date/now'](),
      },
      queues,
    });
  }

  @Action({ rawError: true })
  public async interrupt(payload: { music: Musicx; playedTime: number }) {
    const { music, playedTime } = payload;
    if (!this.status) {
      return;
    }

    const queues = JSON.parse(JSON.stringify(this.queues)) as Musicx[];
    const playingMusic = this.status.player.music;

    queues.unshift({
      ...playingMusic,
      extraStatus: {
        playedTime,
      },
    });

    this.roomRef!.update({
      queues: queues.filter(q => q.id !== music.id),
      player: {
        music,
        playedTime: music.extraStatus?.playedTime || 0,
        status: PlayerStatus.PLAY,
        updatedAt: store.getters['date/now'](),
      },
    });
  }

  @Action({ rawError: true })
  public async forwardMusic() {
    if (!this.status) {
      return;
    }

    const { queues } = this.status;
    await this.setMusicFromQueue(queues);
  }

  @Action({ rawError: true })
  public async fetchCurrentStatus() {
    const snapshot = await this.roomRef!.get();
    const status = snapshot.data() as Room;

    return status;
  }

  @Action({ rawError: true })
  public async leaveRoom(me: RoomUser) {
    this.listener?.();
    await this.removeUser(me);
  }
}

export default getModule(RoomManager);
