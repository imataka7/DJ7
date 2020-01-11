<template>
  <div class="player-controller">
    <div class="controller-container is-flex">
      <div class="player-buttons is-flex">
        <button class="has-bounce">
          <fa-icon icon="forward" rotation="180" size="lg"></fa-icon>
        </button>

        <transition name="bounce" mode="out-in">
          <button
            @click="isTheaterMode = !isTheaterMode"
            v-if="isTheaterMode"
            key="play"
          >
            <fa-icon icon="play" size="lg"></fa-icon>
          </button>
          <button
            @click="isTheaterMode = !isTheaterMode"
            v-else
            key="pause"
            size="lg"
          >
            <fa-icon icon="pause" size="lg"></fa-icon>
          </button>
        </transition>

        <button class="has-bounce">
          <fa-icon icon="forward" size="lg"></fa-icon>
        </button>
      </div>

      <div class="seek-bar-container">
        <seek-bar v-model="playedTime"></seek-bar>
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
        <player-music-info></player-music-info>
      </div>
    </div>
    <div class="player-container">
      <transition>
        <div
          class="youtube-player"
          v-show="
            currentPlayer &&
              currentPlayer.platform === 'YouTube' &&
              isTheaterMode
          "
        ></div>
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
import { Musicx } from '../models/room';
import PlayerStatus from '../models/playerStatus';
import VolumePicker from './molecules/VolumePicker.vue';
import SeekBar from './molecules/SeekBar.vue';
import PlayerMusicInfo from './molecules/PlayerMusicInfo.vue';

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

  private player: SupportedPlatform = {};

  get allPlayers() {
    const { youtube } = this.player;

    return [youtube];
  }

  public async initPlayers() {
    const ytel = this.$el.querySelector('youtube-player') as HTMLElement;

    this.player.youtube = new YouTubePlayer({
      el: ytel,
    });

    await Promise.all(this.allPlayers.map(p => p!.init()));
  }

  private currentMusic?: Musicx;

  private currentPlayer: MusicPlayer | null = null;

  public currentVolume = 50;

  public async loadMusic(music: Musicx) {
    if (this.currentMusic?.id === music.id) {
      return;
    }

    if (!this.currentPlayer || this.currentPlayer?.platform !== music.platform) {
      this.currentPlayer = this.allPlayers.find(p => p!.platform === music.platform)!;
    }

    await this.currentPlayer!.loadMusic(music);
  }

  public async play() {
    if (!this.currentPlayer || this.currentPlayer!.state === PlayerStatus.BUFFERING) {
      return;
    }

    this.$emit('update', PlayerStatus.PLAY, await this.currentPlayer.getCurrentPlayedTime());
  }

  public async pause() {
    if (!this.currentPlayer || this.currentPlayer!.state === PlayerStatus.BUFFERING) {
      return;
    }

    this.$emit('update', PlayerStatus.PAUSE, await this.currentPlayer!.getCurrentPlayedTime());
  }

  public isVolumePickerActive = false;

  public isMute = false;

  public toggleMute() {
    if (this.currentVolume === 0) {
      this.currentVolume = 50;
    } else {
      this.currentVolume = 0;
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

  public playedTime = 0;
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
  // font-family: "Roboto Mono", monospace;
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

    &.has-bounce:active {
      animation: bounce-in 0.1s;
    }
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
