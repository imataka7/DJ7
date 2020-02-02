<template>
  <div
    :class="`player-controller  ${isTheaterMode ? 'is-theater' : ''}`"
    @pointerdown="onPointerStart"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
  >
    <div class="controller-container is-flex">
      <div class="player-buttons is-flex">
        <!-- <button class="has-bounce" :disabled="isControllerDisable">
          <fa-icon icon="forward" rotation="180" size="lg"></fa-icon>
        </button> -->

        <transition name="bounce" mode="out-in">
          <button
            @click="updateStatus(2)"
            v-if="currentStatus === 1"
            key="pause"
            size="lg"
            :disabled="isControllerDisable"
            aria-label="Pause"
          >
            <fa-icon icon="pause" size="lg"></fa-icon>
          </button>
          <button
            @click="updateStatus(1)"
            v-else
            key="play"
            :disabled="isControllerDisable"
            aria-label="Play"
          >
            <fa-icon icon="play" size="lg"></fa-icon>
          </button>
        </transition>

        <button
          class="has-bounce"
          @click="moveMusic('forward')"
          :disabled="currentStatus === 8"
          aria-label="Forward"
        >
          <fa-icon icon="forward" size="lg"></fa-icon>
        </button>
      </div>

      <div class="seek-bar-container">
        <p class="progress-container">
          <span class="progress-start">
            {{ formatDuration(((range * musicDuration) | 0) / 100) }}
          </span>
          <span class="progress-slash">
            /
          </span>
          <span class="progress-end">
            {{ formatDuration(musicDuration) }}
          </span>
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
        v-if="!isPhone && !isTablet"
      >
        <button @click="toggleMute" aria-label="Volume">
          <fa-icon :icon="speakerIcon" size="lg"></fa-icon>
        </button>
        <transition name="fade">
          <volume-picker
            v-model="currentVolume"
            v-if="isVolumePickerActive"
          ></volume-picker>
        </transition>
      </div>
      <div @click="togglePlayerActive" class="music-info-container">
        <div v-if="!isPhone && isPopupShowing" class="click-me">
          <p>Click Me!</p>
        </div>
        <player-music-info
          v-if="currentMusic"
          :music="currentMusic"
        ></player-music-info>
        <p class="no-music-indicator" v-else>No music playing</p>
      </div>
    </div>
    <div class="player-container" @pointermove.stop>
      <!-- <transition>
        <div
          class="youtube-player"
          v-show="
            currentPlayer &&
              currentPlayer.platform === 'YouTube' &&
              isTheaterMode
          "
        ></div>
      </transition> -->
      <youtube-player
        ref="youtube"
        class="youtube-player"
        @end="onMusicEnd"
        @error="onError"
      ></youtube-player>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import isMobile from 'ismobilejs';

import YouTubePlayer from './YoutubePlayer.vue';
import {
  MusicPlayer, Music, Musicx, Player, PlayerStatus,
} from '@/models';
import {
  VolumePicker, SeekBar, PlayerMusicInfo,
} from './molecules';
import { sleep, setEvent } from '@/utils';
import { adate } from '../store/modules';

interface SupportedPlatform {
  youtube?: MusicPlayer;
}

@Component({
  components: {
    VolumePicker,
    SeekBar,
    PlayerMusicInfo,
    'youtube-player': YouTubePlayer,
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
    this.players.youtube = this.$refs.youtube as YouTubePlayer;

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

    const v = localStorage.getItem('popup');
    if (v) {
      this.isPopupShowing = false;
    }

    this.listeners.push(setEvent(window, 'keydown', (e) => {
      if ((e as KeyboardEvent).keyCode === 27) { // Esc
        this.isTheaterMode = false;
      }
    }));
  }

  public listeners: any[] = [];

  public beforeDestory() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.listeners.forEach(l => l.off());
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

  public async onMusicEnd(music: Musicx) {
    this.clearMusicInfo();
    this.$emit('end', music);
  }

  public async onError(music: Musicx) {
    this.clearMusicInfo();
    this.$emit('error', music);
  }

  public moveMusic(direction: 'forward' | 'backward') {
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

  // public currentStatus = PlayerStatus.NO_MUSIC;
  get currentStatus() {
    return this.currentPlayerInfo?.status;
  }

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
    await this.currentPlayer?.stop();
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

  public currentPlayerInfo: Player | null = null;

  public isRangeDragging = false;

  public updateSeekBarRange() {
    const { updatedAt, playedTime } = this.currentPlayerInfo!;
    const diff = this.currentPlayerInfo?.status === PlayerStatus.PLAY
      ? (adate.now() - updatedAt)
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

  public isPopupShowing = true;

  @Watch('isTheaterMode')
  public onTheaterMode() {
    localStorage.setItem('popup', JSON.stringify({ isShowing: true }));
  }

  get isPhone() {
    return isMobile().phone;
  }

  get isTablet() {
    return isMobile().tablet;
  }

  public togglePlayerActive() {
    this.isPopupShowing = false;
    this.isTheaterMode = !this.isTheaterMode;
  }

  public sumMovementY = 0;

  public initialPageY = 0;

  public pointerEventStartAt = 0;

  public onPointerStart(e: PointerEvent) {
    if (window.innerWidth > 1240) {
      return;
    }


    if (this.isTheaterMode) {
      const el = this.$el as HTMLElement;
      el.style.removeProperty('transition');
      this.sumMovementY = 0;
      this.pointerEventStartAt = adate.now();
      this.initialPageY = 0;
    }
  }

  public onPointerMove(e: PointerEvent) {
    if (e.pressure === 0 || window.innerWidth > 1240) {
      return;
    }

    if (this.isTheaterMode) {
      const py = e.pageY;
      if (this.initialPageY === 0) {
        this.initialPageY = py;
      }

      this.sumMovementY = py - this.initialPageY;

      const el = this.$el as HTMLElement;
      if (this.sumMovementY > 0) {
        el.style.transform = `translateY(${this.sumMovementY}px)`;
      }
    }
  }

  public async onPointerEnd(e: PointerEvent) {
    if (window.innerWidth > 1240) {
      return;
    }

    const el = this.$el as HTMLElement;
    el.style.removeProperty('height');
    el.style.setProperty('transition', 'height .3s ease, transform .3s ease-in-out');

    const dy = this.sumMovementY / (adate.now() - this.pointerEventStartAt);
    if (dy > 1 || this.sumMovementY > 200) {
      this.isTheaterMode = false;
    }
    el.style.removeProperty('transform');
  }
}
</script>

<style lang="scss">
.player-controller {
  width: 100%;
  background-color: var(--controller-bg);
  border-top: solid 1px var(--controller-border);
  // font-family: "Roboto Mono", "Meiryo UI", monospace;
  z-index: 20;
}

.is-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.controller-container {
  width: 1240px;
  height: 50px;
  margin: auto;

  .player-buttons {
    width: 120px;
  }

  button {
    cursor: pointer;
    background: transparent;
    border: none;
    transition: color 0.2s;
    color: var(--controller-button-fc);

    &:focus {
      outline: none;
    }

    &:disabled {
      color: var(--controller-button-disabled);
      cursor: not-allowed;
    }

    &:not(:disabled) {
      &.has-bounce:active {
        animation: bounce-in 0.1s;
      }

      &:hover {
        color: var(--controller-button-hover);
      }
    }
  }
}

.seek-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin-right: 30px;
  }
}

.volume-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 50px;
  // height: 100%;
  z-index: 100;
}

.volume-picker {
  position: absolute;
  bottom: 110px;
  right: -55px;
}

.music-info-container {
  position: relative;
  width: 300px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--controller-info-hover);
  }

  .no-music-indicator {
    text-align: center;
  }

  .click-me {
    position: absolute;
    width: 120px;
    height: 50px;
    bottom: 150%;
    left: 30%;
    transform: translateX(-50%);
    background: var(--controller-clickme-bg);
    color: var(--controller-clickme-fc);
    border-radius: 5px;
    text-align: center;
    animation: hovering 1s infinite;

    &:after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 12px 12px 0 12px;
      border-color: var(--controller-clickme-bg) transparent transparent
        transparent;
    }
  }
}

@keyframes hovering {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(10px);
  }
}

.player-container,
.player {
  opacity: 0;
  transition: all 0.5s;
}

.player-container {
  position: fixed;
  top: 100%;
  left: 70%;
  pointer-events: none;
  // width: 100px;
  // height: 100px;

  .is-theater > & {
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - 50px);
    opacity: 1;
    pointer-events: auto;

    .player,
    iframe {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }
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

@media screen and (max-width: 1240px) {
  .player-controller,
  .controller-container {
    width: 100vw;
  }
}

@media screen and (max-width: 960px) {
  .progress-container {
    display: none;
  }
}

@media screen and (max-width: 640px) {
  .player-controller {
    display: flex;
    flex-direction: column-reverse;
    height: 50px;
    touch-action: none;
    // transition: height 0.3s ease, transform 0.3s ease-in-out;
    transition: height 0.3s ease;

    .controller-container {
      width: 100%;

      .seek-bar-container {
        display: none;
        width: 90%;
        flex-direction: column-reverse;
        align-items: flex-start;

        .progress-slash {
          display: none;
        }

        .seek-bar {
          width: 100%;
        }

        p {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin: 0;
        }
      }
    }

    .player-container {
      transition: none;
    }

    &.is-theater {
      height: 500px;
      border-radius: 10px 10px 0 0;
      user-select: none;

      .controller-container {
        height: 200px;
        flex-direction: column-reverse;
        margin-top: 0;
        margin-bottom: 50px;
      }

      .seek-bar-container {
        display: flex;
      }

      .player-container {
        position: relative;
        top: auto;
        left: auto;
        width: 95%;
        height: 250px;
        margin: 40px auto 30px;
        pointer-events: auto;
        touch-action: none;

        .player,
        iframe {
          width: 100%;
          height: 100%;
        }

        &,
        .player,
        iframe {
          opacity: 1;
        }
      }

      &:after {
        content: "";
        position: relative;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 5px;
        background: var(--controller-swipe-handler);
        border-radius: 9999px;
      }
    }
  }
}
</style>
