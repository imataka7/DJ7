import {
  VuexModule, Mutation, Action, Module, getModule,
} from 'vuex-module-decorators';
import firebase from 'firebase/app';
import 'firebase/firestore';

import store from '..';
import PlayerStatus from '@/models/playerStatus';
import Room, { RoomUser, Musicx, Player } from '@/models/room';

const firestore = firebase.firestore();
const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Module({
  name: 'room', namespaced: true, store, dynamic: true,
})
class RoomManager extends VuexModule {
  public roomId: string = '';

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

  get roomRef() {
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

  @Action({ commit: 'setStatus' })
  public async addRoom(roomId: string) {
    const initial = {
      player: {
        music: null,
        playedTime: 0,
        status: PlayerStatus.NO_MUSIC,
        updatedAt: Date.now(),
      },
      queues: [],
      roomId: this.roomId,
      users: [],
    };
    await this.roomRef.set(initial);

    return initial;
  }

  @Action({})
  public async addUser(user: RoomUser) {
    await this.roomRef.update({
      users: arrayUnion(user),
    });
  }

  @Action({})
  public async removeUser(user: RoomUser) {
    await this.roomRef.update({
      users: arrayRemove(user),
    });
  }

  @Action({})
  public async init(roomId: string) {
    this.listener?.();

    this.setRoomId(roomId);

    const snapshot = await this.roomRef.get();

    if (!snapshot.exists) {
      await this.addRoom(roomId);
    } else {
      this.setStatus(snapshot.data() as Room);
    }

    const listener = this.roomRef.onSnapshot(async doc => this.setStatus(doc.data() as Room));
    this.setListener(listener);
  }

  @Action({})
  public async updateQueue(queues: Musicx[]) {
    this.roomRef.update({
      queues,
    });
  }

  @Action({})
  public async changeState(payload: { status: PlayerStatus, playedTime: number }) {
    const { status, playedTime } = payload;

    if (!this.status) {
      return;
    }

    if (status === this.status.player.status
      || this.status.player.status === PlayerStatus.NO_MUSIC) {
      return;
    }

    this.roomRef.update({
      'player.status': status,
      'player.playedTime': playedTime,
      'player.updatedAt': Date.now(),
    });
  }

  @Action({})
  public async seek(to: number) {
    this.roomRef.update({
      'player.playedTime': to,
      'player.updatedAt': Date.now(),
    });
  }

  @Action({})
  public async queueMusic(items: Musicx[]) {
    if (!this.status) {
      return;
    }

    const batch = firestore.batch();

    if (this.status.player.status === PlayerStatus.NO_MUSIC) {
      const nextMusic = items[0];

      batch.update(this.roomRef, {
        'player.status': PlayerStatus.PLAY,
        'player.music': nextMusic,
        'player.updatedAt': nextMusic.extraStatus?.playedTime || Date.now(),
      });

      if (items.length === 1) {
        await batch.commit();
        return;
      }

      items.shift();
    }

    batch.update(this.roomRef, {
      queues: arrayUnion(...items),
    });

    await batch.commit();
  }

  @Action({})
  public async setMusicFromQueue(queues: Musicx[]) {
    if (queues.length === 0) {
      await this.roomRef.update({
        player: {
          music: null,
          playedTime: 0,
          status: PlayerStatus.NO_MUSIC,
          updatedAt: Date.now(),
        },
      });

      return;
    }

    const nextMusic = queues[0];
    queues.shift();

    await this.roomRef.update({
      player: {
        music: nextMusic,
        playedTime: nextMusic.extraStatus?.playedTime || 0,
        status: PlayerStatus.PLAY,
        updatedAt: Date.now(),
      },
      queues,
    });
  }

  @Action({})
  public async interrupt(payload: { music: Musicx, playedTime: number }) {
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

    this.roomRef.update({
      queues: queues.filter(q => q.id !== music.id),
      player: {
        music,
        playedTime: music.extraStatus?.playedTime || 0,
        status: PlayerStatus.PLAY,
        updatedAt: Date.now(),
      },
    });
  }

  @Action({})
  public async forwardMusic() {
    if (!this.status) {
      return;
    }

    const { queues } = this.status;
    await this.setMusicFromQueue(queues);
  }

  @Action({})
  public async fetchCurrentStatus() {
    const snapshot = await this.roomRef.get();
    const status = snapshot.data() as Room;

    return status;
  }
}

export default getModule(RoomManager);
