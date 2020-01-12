<template>
  <div class="player-controller">
    <div class="controller-container is-flex">
      <div class="player-buttons is-flex">
        <button class="has-bounce" :disabled="isControllerDisable">
          <fa-icon icon="forward" rotation="180" size="lg"></fa-icon>
        </button>

        <transition name="bounce" mode="out-in">
          <button
            @click="updateStatus(2)"
            v-if="currentStatus === 1"
            key="pause"
            size="lg"
            :disabled="isControllerDisable"
          >
            <fa-icon icon="pause" size="lg"></fa-icon>
          </button>
          <!-- <button
            v-else-if="currentPlayer && currentPlayer.state === 3"
            key="spin"
            :disabled="isControllerDisable"
          >
            <fa-icon icon="spinner" size="lg" pulse></fa-icon>
          </button> -->
          <button
            @click="updateStatus(1)"
            v-else
            key="play"
            :disabled="isControllerDisable"
          >
            <fa-icon icon="play" size="lg"></fa-icon>
          </button>
        </transition>

        <button
          class="has-bounce"
          @click="moveMusic('forward')"
          :disabled="isControllerDisable"
        >
          <fa-icon icon="forward" size="lg"></fa-icon>
        </button>
      </div>

      <div class="seek-bar-container">
        <p>
          {{ formatDuration(((range * musicDuration) | 0) / 100) }}
          /
          {{ formatDuration(musicDuration) }}
        </p>
        <seek-bar
          v-model="range"
          @input="isRangeDragging = true"
          @seeked="onSeeked"
          :disabled="isControllerDisable"
        ></seek-bar>
      </div>

      <div
        class="volume-container"
        @mouseenter="isVolumePickerActive = true"
        @mouseleave="isVolumePickerActive = false"
      >
        <button @click="toggleMute">
          <fa-icon :icon="speakerIcon" size="lg"></fa-icon>
        </button>
        <transition name="fade">
          <volume-picker
            v-model="currentVolume"
            v-if="isVolumePickerActive"
          ></volume-picker>
        </transition>
      </div>
      <div class="music-info-container">
        <player-music-info
          v-if="currentMusic"
          :music="currentMusic"
        ></player-music-info>
        <p v-else>No music playing</p>
      </div>
    </div>
    <div class="player-container">
      <transition>
        <!-- <div
          class="youtube-player"
          v-show="
            currentPlayer &&
              currentPlayer.platform === 'YouTube' &&
              isTheaterMode
          "
        ></div> -->
        <div class="youtube-player"></div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import YouTubePlayer from '@/components/YoutubePlayer.vue';
import MusicPlayer from '@/models/musicPlayer';
import Music from '../models/music';
import { Musicx, Player } from '../models/room';
import PlayerStatus from '../models/playerStatus';
import VolumePicker from './molecules/VolumePicker.vue';
import SeekBar from './molecules/SeekBar.vue';
import PlayerMusicInfo from './molecules/PlayerMusicInfo.vue';
import sleep from '../utils/sleep';

interface SupportedPlatform {
  youtube?: MusicPlayer;
}

@Component({
  components: {
    VolumePicker,
    SeekBar,
    PlayerMusicInfo,
  },
})
export default class PlayerController extends Vue {
  public isTheaterMode = false;

  private players: SupportedPlatform = {};

  get allPlayers() {
    const { youtube } = this.players;

    return [youtube];
  }

  public timer?: number;

  public async initPlayers() {
    const ytel = this.$el.querySelector('.youtube-player') as HTMLElement;

    const youtube = new YouTubePlayer({
      el: ytel,
    }).$mount();
    youtube.$on('end', this.onMusicEnd);

    this.players.youtube = youtube;

    await Promise.all(this.allPlayers.map(p => p!.init()));

    this.timer = setInterval(() => {
      if (!this.currentPlayerInfo
    || this.isControllerDisable
    || this.currentPlayerInfo.status === PlayerStatus.PAUSE
    || !this.musicDuration
    || this.isRangeDragging) {
        return;
      }

      this.updateSeekBarRange();
    }, 100);
  }

  public beforeDestory() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  public async updateStatus(s: PlayerStatus) {
    if (!this.currentPlayer || this.currentPlayer!.state === PlayerStatus.BUFFERING) {
      return;
    }

    this.$emit('update', s, await this.currentPlayer.getCurrentPlayedTime());
  }

  public clearMusicInfo() {
    this.currentMusic = null;
    this.musicDuration = 0;
    this.range = 0;
  }

  public async onMusicEnd() {
    this.clearMusicInfo();
    this.$emit('end');
  }

  public moveMusic(direction: 'forward' | 'backword') {
    this.clearMusicInfo();
    this.$emit(direction);
  }

  get isControllerDisable() {
    if (!this.currentPlayer) {
      return true;
    }

    const { BUFFERING, NO_MUSIC } = PlayerStatus;
    const isPlayerDisable = [BUFFERING, NO_MUSIC].some(s => s === this.currentPlayer?.state);
    const isNoMusic = this.currentStatus === PlayerStatus.NO_MUSIC;
    return isPlayerDisable || isNoMusic;
  }

  private currentMusic: Musicx | null = null;

  private currentPlayer: MusicPlayer | null = null;

  public currentVolume = 50;

  public currentStatus = PlayerStatus.NO_MUSIC;

  public musicDuration = 0;

  public async loadMusic(music: Musicx) {
    if (this.currentMusic?.id === music.id) {
      return;
    }

    if (!this.currentPlayer || this.currentPlayer?.platform !== music.platform) {
      this.currentPlayer = this.allPlayers.find(p => p!.platform === music.platform)!;
      await this.initVolume();
    }

    this.currentMusic = music;
    await this.currentPlayer.loadMusic(music);

    this.musicDuration = await this.currentPlayer.getDuration();

    this.updateSeekBarRange();
  }

  private async initVolume() {
    const vol = localStorage.getItem('volume') || '30';
    this.currentVolume = parseInt(vol, 10);
    await this.currentPlayer!.setVolume(this.currentVolume);
  }

  public async play() {
    await this.currentPlayer?.play();
  }

  public async pause() {
    await this.currentPlayer?.pause();
  }

  public async stop() {
    this.currentPlayer?.stop();
  }

  public async seekTo(to: number) {
    this.updateSeekBarRange();
    this.currentPlayer?.seekTo(to);
  }

  public async getPlayedTime() {
    return this.currentPlayer?.getCurrentPlayedTime();
  }

  public isVolumePickerActive = false;

  public isMute = false;

  public toggleMute() {
    if (this.currentVolume === 0) {
      const vol = localStorage.getItem('volume') || '30';
      this.currentVolume = parseInt(vol, 10);
    } else {
      const prevVolume = this.currentVolume;
      this.currentVolume = 0;
      // Make sure to work `setItem` after `onVolumeChanged`
      Promise.resolve().then(() => {
        localStorage.setItem('volume', prevVolume.toString(10));
      });
    }
  }

  get speakerIcon() {
    if (this.currentVolume === 0) {
      return 'volume-mute';
    }

    if (this.currentVolume > 0 && this.currentVolume < 60) {
      return 'volume-down';
    }

    return 'volume-up';
  }

  @Watch('currentVolume')
  public onVolumeChanged(vol: number) {
    localStorage.setItem('volume', vol.toString(10));
    this.currentPlayer?.setVolume(vol);
  }

  public range = 0;

  public currentPlayerInfo?: Player;

  public isRangeDragging = false;

  public updateSeekBarRange() {
    const { updatedAt, playedTime } = this.currentPlayerInfo!;
    const diff = this.currentPlayerInfo?.status === PlayerStatus.PLAY
      ? (Date.now() - updatedAt)
      : 0;
    const per = (playedTime + diff / 1000) / this.musicDuration;

    if (per >= 1) {
      this.range = 100;
      return;
    }

    this.range = per * 100;
  }

  public onSeeked(r: number) {
    this.isRangeDragging = false;
    this.$emit('seeked', r * this.musicDuration / 100);
  }

  public formatDuration(duration: number) {
    const d = new Date(duration * 1000);

    const h = Math.floor(d.getTime() / 3600000);
    const m = d.getMinutes() + h * 60;
    const s = `0${d.getSeconds() + h * 60}`.slice(-2);

    return `${m}:${s}`;
  }
}
</script>

<style lang="scss" scoped>
.player-controller {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 50px;
  background-color: #eee;
  border-top: solid 1px #bbb;
  font-family: "Roboto Mono", "Meiryo UI", monospace;
}

.is-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.controller-container {
  height: 100%;
  width: 1240px;
  margin: auto;

  .player-buttons {
    width: 120px;
  }

  button {
    cursor: pointer;
    background: transparent;
    border: none;

    &:focus {
      outline: none;
    }

    &:disabled {
      color: #555;
      cursor: not-allowed;
    }

    &.has-bounce:not(:disabled):active {
      animation: bounce-in 0.1s;
    }
  }
}

.seek-bar-container {
  display: flex;
  justify-content: space-around;
  align-items: center;

  p {
    padding-top: 3px;
    margin-right: 30px;
  }
}

.volume-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 50px;
  height: 100%;
}

.volume-picker {
  position: absolute;
  bottom: 110px;
  right: -55px;
}

.music-info-container {
  width: 300px;
}

.player-container {
  position: fixed;
  top: 100px;
  right: 100px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.1s;
}

// .bounce-leave-active {
//   animation: bounce-in 0.1s reverse;
// }

@keyframes bounce-in {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
