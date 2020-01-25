<template>
  <div class="hub">
    <div class="swiper-container">
      <div class="columns swiper-wrapper">
        <div class="column swiper-slide input-container">
          <div class="room-desc">
            <h2>MusicHub</h2>
            <h2>RoomId: {{ roomId }}</h2>
            <span class="version">{{ version }}</span>
          </div>

          <div class="room-users">
            <img v-for="u in users" :key="u.id" :src="u.photo" alt="icon" />
          </div>

          <input-area @parsed="addQueue"></input-area>

          <div class="ad-container"></div>

          <div class="jumper">
            <input type="text" v-model="jumpTo" />
            <button @click="jump">Jump</button>
          </div>
          <button @click="$auth.signOut()">Sign out</button>
        </div>

        <div class="column swiper-slide">
          <p class="header">Queue</p>
          <div class="no-music" v-if="queues.length === 0">
            No music in queue
          </div>
          <music-queue
            v-model="queues"
            @interrupt="interrupt"
            :is-draggable="!isQueueUpdating"
            class="music-list"
            v-else
          ></music-queue>
        </div>

        <div class="column swiper-slide">
          <p class="header">History</p>
          <!-- <button @click="migrateHistory">Upgrade history yah</button> -->
          <div class="no-music" v-if="history.length === 0">
            No music in history
          </div>
          <history-list
            :list="history"
            @add="addQueue"
            @del="deleteMusicFromHistory"
            class="music-list"
            v-else
          ></history-list>
        </div>
      </div>
    </div>
    <!-- <pre>{{ roomStatus }}</pre>
    <pre>{{ userStatus }}</pre>
    <pre>{{ JSON.stringify(currentUser, null, "  ") }}</pre> -->

    <!-- <div class="player-controller"></div> -->
    <player-controller ref="controller"></player-controller>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Swiper from 'swiper';
import isMobile from 'ismobilejs';

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
import setEvent from '../utils/eventUtil';

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
  get version() {
    return process.env.VUE_APP_VERSION;
  }

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

  get roomRef() {
    return this.$firestore.collection('rooms').doc(this.roomId);
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

  private controller!: PlayerController;

  public async init() {
    this.roomId = this.$route.params.roomId || 'general';
    this.registerEvents();

    const snapshot = await this.roomRef.get();
    let roomStatus = snapshot.data() as Room;

    if (!snapshot.exists) {
      this.addRoom();
      roomStatus = (await this.roomRef.get()).data() as Room;
    }

    this.controller = this.$refs.controller as PlayerController;
    this.controller.$on('update', this.onStatusChanged);
    this.controller.$on('end', this.onMusicEnded);
    this.controller.$on('forward', this.forwardMusic);
    this.controller.$on('seeked', this.onSeeked);
    this.controller.$on('error', this.onError);

    await this.controller.initPlayers();

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

      await this.setStatus(status, seekTo);
    });

    this.unsubscribeListers.push(listener);
  }

  private async setStatus(status: PlayerStatus, to: number) {
    this.controller.currentStatus = status;
    await this.controller.seekTo(to);

    const { PLAY, PAUSE, NO_MUSIC } = PlayerStatus;
    switch (status) {
      case PLAY:
        await this.controller.play();
        return;
      case PAUSE:
        await this.controller.pause();
        return;
      case NO_MUSIC:
        await this.controller.stop();
        break;
      default:
    }
  }

  public async onSeeked(time: number) {
    this.roomRef.update({
      'player.playedTime': time,
      'player.updatedAt': Date.now(),
    });
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

  public async updateRoomStatus(roomStatus: Room) {
    this.isQueueUpdating = true;

    const previousId = this.roomStatus?.player.music?.id;
    this.roomStatus = roomStatus;
    this.controller.currentPlayerInfo = roomStatus.player;

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

      await this.controller.loadMusic(music);

      await this.updateHistory({
        source,
        platform,
        thumbnail,
        title,
      });
    }
  }

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

  public swiper?: Swiper;

  public initSwiper() {
    this.swiper = new Swiper('.swiper-container', {
      direction: 'horizontal',
      loop: false,
      slidesPerView: 1,
      breakpoints: {
        1240: {
          slidesPerView: 3,
          allowTouchMove: false,
        },
      },
    });
  }

  public updateSwiper() {
    if (window.innerWidth < 1240 && !this.swiper) {
      this.initSwiper();
      return;
    }

    this.swiper?.update();
  }

  public async mounted() {
    if (window.innerWidth < 1240) {
      this.initSwiper();
    }

    setEvent(window, 'resize', this.updateSwiper);

    await Promise.all([
      this.initUser(),
      this.init(),
    ]);
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

    const snapshot = await this.roomRef.get();
    const status = snapshot.data() as Room;

    const { player, queues } = status;
    const { music, playedTime, updatedAt } = player;

    // チャタリング対策
    if (playedTime === 0 && Date.now() - updatedAt < 3000) {
      return;
    }

    this.setMusicFromQueue(queues);
  }

  public async onError(playedMusic: Musicx) {
    const snapshot = await this.roomRef.get();
    const status = snapshot.data() as Room;

    const { player, queues } = status;
    const { music, playedTime, updatedAt } = player;

    // console.log(music, errorMusic);

    if (music.id === playedMusic.id) {
      this.setMusicFromQueue(queues);
    }
  }

  private async forwardMusic() {
    const { queues } = this.roomStatus!;
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
    const playedTime = await this.controller.getPlayedTime();

    if (!playedTime) {
      return;
    }

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
.hub {
  width: 100%;
  height: 100%;
  margin: auto;
  overflow: hidden;
}

.swiper-container {
  width: 1240px;
  height: 100%;
  margin: auto;
}

.columns {
  display: flex;
  justify-content: center;
  height: calc(100% - 50px);
}

.column {
  padding: 10px;
  font-family: "Roboto Mono", monospace;

  &.input-container {
    width: 300px;
    overflow: auto;
  }
}

.room-desc {
  margin-bottom: 30px;
}

.room-users {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 50px;
  width: 100%;
  margin-bottom: 5px;
  // flex-wrap: wrap;
  overflow-x: overlay;

  img {
    height: 50px;
  }
}

.ad-container {
  width: 250px;
  height: 250px;
  margin: 10px auto;
  background: #ddd;
}

.header {
  margin: 0;
  height: 30px;
  text-align: center;
  border-bottom: solid 1px var(--hub-header-border);
  font-size: 1.2em;
  font-weight: 700;
}

.music-list {
  width: 430px;
  max-height: calc(100% - 20px);
  overflow-x: hidden;
  overflow-y: auto;
}

.no-music {
  width: 420px;
  padding: 10px;
  margin-top: 10px;
  background: var(--hub-no-music-bg);
  color: var(--hub-no-music-fc);
  text-align: center;
}

.player-controller {
  position: fixed;
  bottom: 0;
  z-index: 100;
}

@media screen and (max-width: 1200px) {
  .hub,
  .columns {
    width: 300vw;
    margin: 0;
  }

  .swiper-container {
    width: 100vw;
    height: 100%;
    overflow-y: auto;
    margin: 0;
  }

  .column,
  .input-container {
    width: 90vw;
    padding: 10px 5vw;
    overflow-x: hidden;
    overflow-y: hidden;

    &:first-child {
      overflow-y: auto;
    }
  }

  .music-list {
    width: calc(90vw - 10px);
    user-select: none;
  }

  .no-music {
    width: calc(90vw - 20px);
  }
}
</style>
