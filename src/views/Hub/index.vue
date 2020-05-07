<template>
  <div class="hub">
    <div class="swiper-container">
      <div class="columns swiper-wrapper">
        <div class="column swiper-slide input-container">
          <div class="room-desc">
            <img class="dj7-logo" :src="require('@/assets/logo.png')" alt="DJ7" />
            <p>
              RoomId: {{ roomId }}
              <share-button
                :room-id="roomId"
                :now-playing="playingMusic && playingMusic.title"></share-button>
            </p>
            <span class="version">{{ version }}</span>
          </div>

          <div class="room-users">
            <img
              v-for="u in users"
              :key="u.id"
              :src="u.photo"
              alt="icon"
              loading="lazy"
              width="50"
              height="50"
            />
          </div>

          <input-area @parsed="addQueue"></input-area>

          <div class="ad-container">
            <ad-square></ad-square>
          </div>

          <div class="jumper">
            <label>
              <p class="label-desc">Do you want to change the room?</p>
              <input type="text" v-model="jumpTo" :disabled="!currentUser" placeholder="Room id" />
              <abutton @click="jump" :disabled="!currentUser">Jump</abutton>
            </label>
          </div>
          <abutton @click="signOut" :disabled="!currentUser">Sign out</abutton>
        </div>

        <div class="column swiper-slide">
          <p class="header">Queue</p>
          <div class="no-music" v-if="queues.length === 0">No music in queue</div>
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
          <template v-if="!currentUser">
            <div class="no-music">Only available for signed in users</div>
            <div class="button-container">
              <abutton class="is-large" @click="$router.push('/signin')">Sign in</abutton>
            </div>
          </template>
          <div class="no-music" v-else-if="history.length === 0">No music in history</div>
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
      @speed="onSpeedChanged"
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
  YoutubePlayer,
  InputArea,
  MusicQueue,
  HistoryList,
  PlayerController,
  ShareButton,
  AdSquare,
} from '@/components';
import {
  Room, RoomUser, Musicx, Music, User, PlayerStatus,
} from '@/models';
import {
  sleep,
  setEvent,
  getEmbedUrl,
  getMusicInfo,
  getClone,
  showToast,
} from '@/utils';
import { user, room, adate } from '@/store/modules';
import { ActionButton } from '@/components/molecules';
import { logger } from '@/plugins/logger';

const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Component({
  components: {
    YoutubePlayer,
    InputArea,
    MusicQueue,
    HistoryList,
    PlayerController,
    ShareButton,
    abutton: ActionButton,
    AdSquare,
  },
})
export default class Hub extends Vue {
  get version() {
    return `v${process.env.VUE_APP_VERSION.replace('+', ' on ')}`;
  }

  get currentUser() {
    return user.user;
  }

  get me() {
    return user.me;
  }

  @Watch('currentUser', { immediate: true })
  public onAuthStateChanged() {
    if (this.me) {
      room.addUser(this.me);
      user.addVisitedRooms(this.roomId);
    }
  }

  public async signOut() {
    this.$ga.logEvent('sign_out');

    this.$router.push('/signin');
    await room.leaveRoom(this.me!);
    await user.signOut();
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
    const users = room?.users || [];
    return getClone(users).reverse();
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
      await this.setStatus(status, 0);
      return;
    }

    const {
      source, platform, id, thumbnail, title,
    } = music;

    if (id && id !== previousId) {
      user.updateHistory(music);

      await this.controller.loadMusic(music);
    }

    if (
      oldStatus?.player.playedTime === playedTime
      && status === oldStatus?.player.status
    ) {
      return;
    }

    const seekTo = status === PlayerStatus.PLAY
      ? (adate.now() - updatedAt) / 1000 + playedTime
      : playedTime;

    await this.setStatus(status, seekTo);
  }

  private async setStatus(status: PlayerStatus, to: number) {
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

  public async updateHistory(music: Musicx) {
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

    await Promise.all([this.init()]);
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
    const currentTime = adate.now();
    const timeElapsedFromUpdated = currentTime - updatedAt;
    const isUpdateAtTooNear = playedTime === 0 && timeElapsedFromUpdated < 3000;
    // いままでローカルで再生していた曲とDB上の曲が違うとき === 他の人がすでに切り替えている
    const isDifferentMusic = playedMusic.id !== music.id;
    if (isUpdateAtTooNear || isDifferentMusic) {
      return;
    }

    this.$logger.info('music end', {
      content: {
        playedMusic,
        timeElapsedFromUpdated,
        currentTime,
        nextMusic: queues[0],
        remoteMusic: player.music,
      },
    });

    room.setMusicFromQueue(queues);
  }

  public async onError(playedMusic: Musicx, code: number) {
    const status = await room.fetchCurrentStatus();

    const { player, queues } = status;
    const { music, playedTime, updatedAt } = player;

    // console.log(music, errorMusic);

    if (music.id === playedMusic?.id) {
      room.setMusicFromQueue(queues);

      this.$logger.error('player error', {
        content: {
          music: playedMusic,
          code,
        },
      });
    }

    showToast('error', `An error occurs in the player. code: ${code}`);
  }

  private async forwardMusic() {
    room.forwardMusic();
  }

  public jumpTo = '';

  public jump() {
    if (!this.jumpTo) {
      return;
    }

    this.$ga.logEvent('jump', {
      roomId: this.jumpTo,
    });
    this.$logger.info('jump', {
      content: {
        roomId: this.jumpTo,
      },
    });

    const { origin } = window.location;
    window.location.href = `${origin}/${this.jumpTo.trim()}`;
  }

  public async interrupt(music: Musicx) {
    const playedTime = await this.controller.getPlayedTime();

    // if (!playedTime) {
    //   return;
    // }

    await room.interrupt({ music, playedTime: playedTime || 0 });
  }

  public async deleteMusicFromHistory(music: Music) {
    await user.deleteHistoryItem(music);
  }

  public async onSpeedChanged(s: number) {
    await room.updatePlayingSpeed(s);
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
  margin-bottom: 15px;
}

.room-users {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 50px;
  width: 100%;
  margin-bottom: 10px;
  // flex-wrap: wrap;
  overflow-x: overlay;

  img {
    height: 50px;
  }
}

.ad-container {
  min-width: 50px;
  min-height: 50px;
  margin: 10px auto;
}

.label-desc {
  margin: 0;
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

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.player-controller {
  position: fixed;
  bottom: 0;
  z-index: 100;
}

.jumper {
  margin-bottom: 15px;
}

.dj7-logo {
  height: 50px;
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
