<template>
  <div class="hub">
    <input type="text" v-model="jumpTo" />
    <button @click="jump">Jump</button>
    <h1>
      MusicHub RoomId: {{ roomId }}
      <br />
      Welcome {{ currentUser.displayName }}
      {{ isHost ? "You are the host" : "" }}
    </h1>
    <img
      v-for="u in users"
      :key="u.id"
      style="width: 75px; height: 75px;"
      :src="u.photo"
      alt="icon"
    />
    <button @click="$auth.signOut()">Sign out</button>

    <p>
      <a href="https://www.youtube.com/embed/oOv98YTPkUs">
        debug you no url dao
      </a>
      <br />
      <router-link :to="`/${this.roomId}`" v-if="isRequestOnly">
        Go player mode
      </router-link>
      <!-- <router-link :to="`/${this.roomId}/req`" v-else>
        Go requrest only mode
      </router-link> -->
      <router-link to="/about">Realtime Tester</router-link>
    </p>

    <div class="player-container" v-if="!isRequestOnly"></div>

    <input-area @parsed="addQueue"></input-area>

    <div style="margin: 10px 0;">
      <span style="font-weight: 700;">Queue</span>
      <music-queue
        v-model="queues"
        @interrupt="interrupt"
        :is-draggable="!isQueueUpdating"
      ></music-queue>
      <div
        style="color: #fff; background: #333; width: 300px; padding: 10px;"
        v-if="queues.length === 0"
      >
        No videos in the queue
      </div>
    </div>

    <p style="margin-top: 50px">
      <span style="font-weight: 700;">History</span>
      <button @click="migrateHistory">Upgrade history yah</button>
      <history-list
        :list="history"
        @add="addQueue"
        @del="deleteMusicFromHistory"
      ></history-list>
    </p>

    <pre>{{ roomStatus }}</pre>
    <pre>{{ userStatus }}</pre>
    <pre>{{ JSON.stringify(currentUser, null, "  ") }}</pre>

    <player-controller></player-controller>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/firestore';

import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import { getEmbedUrl, getMusicInfo } from '@/utils/urlParser';
import YoutubePlayer from '@/components/YoutubePlayer.vue';
import InputArea from '@/components/InputArea.vue';
import MusicQueue from '@/components/MusicQueue.vue';
import Room, { RoomUser, Musicx } from '@/models/room';
import Music from '@/models/music';
import User from '@/models/user';
import PlayerStatus from '../models/playerStatus';
import HistoryList from '@/components/HistoryList.vue';
import PlayerController from '@/components/PlayerContoroller.vue';
import sleep from '../utils/sleep';

const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Component({
  components: {
    YoutubePlayer,
    InputArea,
    MusicQueue,
    HistoryList,
    PlayerController,
  },
})
export default class Hub extends Vue {
  get currentUser() {
    return this.$auth.currentUser!;
  }

  get me(): RoomUser {
    const { uid, photoURL } = this.currentUser;
    return {
      uid,
      photo: photoURL,
    };
  }

  public userStatus: User | null = null;

  get userRef() {
    return this.$firestore.collection('users').doc(this.currentUser.uid);
  }

  get history() {
    return this.userStatus?.history || [];
  }

  public roomId = '';

  get isRequestOnly() {
    return !!this.$route.path.match(/\/req$/);
  }

  get roomRef() {
    return this.$firestore.collection('rooms').doc(this.roomId);
  }

  get isHost() {
    return this.currentUser.uid === this.roomStatus?.users[0]?.uid;
  }

  public roomStatus: Room | null = null;

  public isQueueUpdating = false;

  get queues() {
    return this.roomStatus?.queues || [];
  }

  set queues(newVal) {
    this.roomRef.update({
      queues: newVal,
    });
  }

  get playingMusic() {
    return this.roomStatus?.player.music;
  }

  get users() {
    return this.roomStatus?.users;
  }

  public unsubscribeListers: (() => void)[] = [];

  public registerEvents() {
    window.addEventListener('beforeunload', this.destructor);
  }

  public unregisterEvents() {
    window.removeEventListener('beforeunload', this.destructor);
  }

  private previousPlayedTime?: number;

  public addRoom() {
    this.roomRef.set({
      player: {
        music: null,
        playedTime: 0,
        status: PlayerStatus.NO_MUSIC,
        updatedAt: Date.now(),
      },
      queues: [],
      roomId: this.roomId,
      users: [],
    });
  }

  public async init() {
    this.roomId = this.$route.params.roomId;
    this.registerEvents();

    const snapshot = await this.roomRef.get();
    let roomStatus = snapshot.data() as Room;

    if (!snapshot.exists) {
      this.addRoom();
      roomStatus = (await this.roomRef.get()).data() as Room;
    }

    const container = this.$el.querySelector('.player-container') as HTMLElement;
    container?.insertAdjacentHTML('afterbegin', '<div class="player-is-here"></div>');

    this.player = new YoutubePlayer({
      el: '.player-is-here',
    });
    this.player.$on('update', this.onStatusChanged);
    this.player.$on('end', this.onMusicEnded);

    await this.player.init();

    await this.updateRoomStatus(roomStatus);

    this.roomRef.update({
      users: arrayUnion(this.me),
    });

    const listener = this.roomRef.onSnapshot(async (doc) => {
      const previousRoomState = this.roomStatus;
      await this.updateRoomStatus(doc.data() as Room);

      const { updatedAt, playedTime, status } = this.roomStatus!.player;

      if (this.previousPlayedTime === playedTime && status === previousRoomState?.player.status) {
        return;
      }

      this.previousPlayedTime = playedTime;
      const seekTo = status === PlayerStatus.PLAY
        ? ((Date.now() - updatedAt) / 1000) + playedTime : playedTime;

      this.player?.setStatus(status, seekTo);
    });

    this.unsubscribeListers.push(listener);
  }

  public async initUser() {
    let snapshot = await this.userRef.get();

    if (!snapshot.exists) {
      await this.userRef.set({
        uid: this.currentUser.uid,
        history: [],
      });
      snapshot = await this.userRef.get();
    }

    this.userStatus = snapshot.data() as User;

    const listener = this.userRef.onSnapshot(async (doc) => {
      this.userStatus = doc.data() as User;
    });

    this.unsubscribeListers.push(listener);
  }

  private player: YoutubePlayer | null = null;

  public async updateRoomStatus(roomStatus: Room) {
    this.isQueueUpdating = true;

    const previousId = this.roomStatus?.player.music?.id;
    this.roomStatus = roomStatus;

    setTimeout(() => {
      this.isQueueUpdating = false;
    }, 100);

    const {
      music, updatedAt, playedTime, status,
    } = roomStatus.player;

    if (!music || status === PlayerStatus.NO_MUSIC) {
      this.musicSource = '';
      return;
    }

    const {
      source, platform, id, thumbnail, title,
    } = music;

    if (id && id !== previousId) {
      this.musicSource = source;


      await this.player!.loadMusic(music);

      await this.updateHistory({
        source,
        platform,
        thumbnail,
        title,
      });
    }
  }

  // TODO: use transaction
  public async updateHistory(music: Music) {
    const { source } = music;

    const isExists = this.history.some(h => h.source === source);

    const batch = this.$firestore.batch();

    if (isExists) {
      batch.update(this.userRef, {
        history: arrayRemove(music),
      });
    }

    batch.update(this.userRef, {
      history: arrayUnion(music),
    });

    await batch.commit();
  }

  public async mounted() {
    await this.initUser();
    await this.init();
  }

  public unsubscribeUser() {
    this.roomRef.update({
      users: arrayRemove(this.me),
    });
  }

  private destructor() {
    this.unsubscribeUser();
    this.unsubscribeListers.forEach(u => u());
  }

  public beforeDestroy() {
    this.unregisterEvents();
    this.destructor();
  }

  public musicSource: string = '';

  public musicSourceInner: string = 'https://www.youtube.com/embed/oOv98YTPkUs';

  public async addQueue(items: Musicx[]) {
    const batch = this.$firestore.batch();

    if (this.roomStatus?.player.status === PlayerStatus.NO_MUSIC) {
      const nextMusic = items[0];

      batch.update(this.roomRef, {
        'player.status': PlayerStatus.PLAY,
        'player.music': nextMusic,
        'player.updatedAt': nextMusic.extraStatus?.playedTime || Date.now(),
      });

      if (items.length === 1) {
        return;
      }

      items.shift();
    }

    batch.update(this.roomRef, {
      queues: arrayUnion(...items),
    });

    await batch.commit();
  }

  private onStatusChanged(status: number, playedTime: number) {
    if (status === this.roomStatus?.player.status
    || this.roomStatus?.player.status === PlayerStatus.NO_MUSIC) {
      return;
    }

    this.roomRef.update({
      'player.status': status,
      'player.playedTime': playedTime,
      'player.updatedAt': Date.now(),
    });
  }

  private async onMusicEnded() {
    if (this.roomStatus?.player.status === PlayerStatus.NO_MUSIC) {
      return;
    }

    const { player, queues } = this.roomStatus!;
    const { music } = player;

    // チャタリング対策
    if (player.playedTime === 0 && Date.now() - player.updatedAt < 1000) {
      return;
    }

    this.setMusicFromQueue(queues);
  }

  private setMusicFromQueue(queues: Musicx[]) {
    if (queues.length === 0) {
      this.roomRef.update({
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

    this.roomRef.update({
      player: {
        music: nextMusic,
        playedTime: nextMusic.extraStatus?.playedTime || 0,
        status: PlayerStatus.PLAY,
        updatedAt: Date.now(),
      },
      queues,
    });
  }

  public jumpTo = '';

  public jump() {
    if (!this.jumpTo) {
      return;
    }

    const { origin } = window.location;
    window.location.href = `${origin}/${this.jumpTo}`;
  }

  public async interrupt(music: Musicx) {
    const playedTime = await this.player!.getCurrentPlayedTime();

    const queues = JSON.parse(JSON.stringify(this.queues)) as Musicx[];
    queues.unshift({
      ...this.playingMusic!,
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

  public async deleteMusicFromHistory(music: Music) {
    this.userRef.update({
      history: arrayRemove(music),
    });
  }

  public async migrateHistory() {
    const newHistory = [];

    for (let i = 0; i < this.history.length; i += 1) {
      // eslint-disable-next-line
      const m = await getMusicInfo(this.history[i].source);
      delete m!.id;
      newHistory.push(m);
    }

    this.userRef.update({
      history: newHistory,
    });
  }
}
</script>

<style lang="scss" scoped>
</style>
