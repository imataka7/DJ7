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

    <player-controller
      ref="controller"
      @update="onStatusChanged"
      @end="onMusicEnded"
      @error="onError"
      @forward="forwardMusic"
      @seeked="onSeeked"
    ></player-controller>
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

import {
  YoutubePlayer, InputArea, MusicQueue, HistoryList, PlayerController,
} from '@/components';
import {
  Room, RoomUser, Musicx, Music, User, PlayerStatus,
} from '@/models';
import {
  sleep, setEvent, getEmbedUrl, getMusicInfo,
} from '@/utils';
import { user, room, adate } from '@/store/modules';

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
    return user.user;
  }

  get me() {
    if (!this.currentUser) {
      return null;
    }

    const { uid, photoURL } = this.currentUser;
    return {
      uid,
      photo: photoURL,
    } as RoomUser;
  }

  get history() {
    return user.history || [];
  }

  public isQueueUpdating = false;

  get queues() {
    return room.queues || [];
  }

  set queues(newVal) {
    if (!newVal) {
      return;
    }

    room.updateQueue(newVal);
  }

  get playingMusic() {
    return room?.player?.music;
  }

  get users() {
    return room?.users || [];
  }

  private controller!: PlayerController;

  get roomId() {
    return this.$route.params.roomId || 'general';
  }

  public async init() {
    this.controller = this.$refs.controller as PlayerController;
    await this.controller.initPlayers();

    await room.init(this.roomId);

    if (this.me) {
      room.addUser(this.me);
    }
  }

  get roomStatus() {
    return room.status;
  }

  @Watch('roomStatus', { deep: true })
  public async onRoomStatusChanged(newStatus: Room, oldStatus: Room) {
    this.isQueueUpdating = true;

    const previousId = oldStatus?.player.music?.id;
    this.controller.currentPlayerInfo = newStatus.player;

    setTimeout(() => {
      this.isQueueUpdating = false;
    }, 100);

    const {
      music, updatedAt, playedTime, status,
    } = newStatus.player;

    if (!music || status === PlayerStatus.NO_MUSIC) {
      return;
    }

    const {
      source, platform, id, thumbnail, title,
    } = music;

    if (id && id !== previousId) {
      await this.controller.loadMusic(music);

      user.updateHistory(music);
    }

    if (oldStatus?.player.playedTime === playedTime
    && status === oldStatus?.player.status) {
      return;
    }

    const seekTo = status === PlayerStatus.PLAY
      ? ((adate.now() - updatedAt) / 1000) + playedTime
      : playedTime;

    await this.setStatus(status, seekTo);
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
    room.seek(time);
  }

  public async updateHistory(music: Music) {
    await user.updateHistory(music);
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
      this.init(),
    ]);
  }

  public beforeDestroy() {
    if (this.me) {
      room.removeUser(this.me);
    }
    room.listener?.();
    room.setListener(() => undefined);
  }

  public async addQueue(items: Musicx[]) {
    room.queueMusic(items);
  }

  private onStatusChanged(status: PlayerStatus, playedTime: number) {
    room.changeState({ status, playedTime });
  }

  private async onMusicEnded(playedMusic: Musicx) {
    if (room?.player?.status === PlayerStatus.NO_MUSIC) {
      return;
    }

    const status = await room.fetchCurrentStatus();

    const { player, queues } = status;
    const { music, playedTime, updatedAt } = player;

    // チャタリング対策
    // 更新時間が近いとき
    // 再生された時間が0のときに限定しているのは
    // 一時停止のタイミングなどによって切り替わらなくなってしまうため
    const isUpdateAtTooNear = playedTime === 0 && adate.now() - updatedAt < 3000;
    // いままでローカルで再生していた曲とDB上の曲が違うとき === 他の人がすでに切り替えている
    const isDifferentMusic = playedMusic.id !== music.id;
    if (isUpdateAtTooNear || isDifferentMusic) {
      return;
    }

    room.setMusicFromQueue(queues);
  }

  public async onError(playedMusic: Musicx) {
    const status = await room.fetchCurrentStatus();

    const { player, queues } = status;
    const { music, playedTime, updatedAt } = player;

    // console.log(music, errorMusic);

    if (music.id === playedMusic.id) {
      room.setMusicFromQueue(queues);
    }
  }

  private async forwardMusic() {
    room.forwardMusic();
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

    await room.interrupt({ music, playedTime });
  }

  public async deleteMusicFromHistory(music: Music) {
    await user.deleteHistoryItem(music);
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
