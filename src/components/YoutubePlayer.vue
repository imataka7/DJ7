<template>
  <div class="youtube-player player">
    <div class="video-player"></div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */

import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import YouTube from 'youtube-player';
import { YouTubePlayer } from 'youtube-player/dist/types';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import PlayerStatus from '@/models/playerStatus';
import MusicPlayer from '@/models/musicPlayer';
import sleep from '../utils/sleep';
import Music from '../models/music';
import { Musicx } from '../models/room';

@Component
export default class PlayerYoutube extends Vue implements MusicPlayer {
  public platform = 'YouTube';

  get isMobile() {
    const mobiles = /Android|webOS|iPhone|iPad|iPod/i;
    return mobiles.test(window.navigator.userAgent);
  }

  public player!: YouTubePlayer;

  public async init() {
    const el = this.$el.querySelector('.video-player');
    this.player = YouTube(el as HTMLElement, {
      playerVars: {
        // controls: 0,
        disablekb: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
    });

    if (this.isMobile) {
      this.player.mute();
    }

    this.player.on('stateChange', async (e) => {
      this.state = e.data;
      if (e.data === 0) {
        this.end();
      }
    });

    this.player.on('error', async (e) => {
      // @ts-ignore
      this.$emit('error', this.currentMusic, e.data);
      this.currentMusic = undefined;
    });
  }

  public async play() {
    this.player.playVideo();
  }

  public async pause() {
    this.player.pauseVideo();
  }

  public async end() {
    this.$emit('end', this.currentMusic);
    this.currentMusic = undefined;
  }

  public async getCurrentPlayedTime() {
    return this.player.getCurrentTime();
  }

  public async changeVolume(level: number) {
    const currentVolume = await this.player.getVolume();
    this.player.setVolume(currentVolume + level);
  }

  public query = '';

  public async cue() {
    // await sleep(3000);
    // console.log(this.query);
    await this.player.loadVideoByUrl(this.query);
  }

  public currentMusic?: Musicx;

  async loadMusic(music: Musicx): Promise<void> {
    return new Promise<void>(async (r) => {
      const listener = this.player.on('stateChange', async (e) => {
        if (e.data === 1) {
          // await this.player.pauseVideo();
          r();
          // @ts-ignore
          this.player.off(listener);
        }
      });

      this.currentMusic = music;
      await this.player.loadVideoByUrl({ mediaContentUrl: music.source, startSeconds: 0 });
    });
  }

  async stop(): Promise<void> {
    await this.player.stopVideo();
  }

  async seekTo(to: number): Promise<void> {
    await this.player.seekTo(to, true);
  }

  async setVolume(vol: number): Promise<void> {
    await this.player.setVolume(vol);
  }

  iframeState: PlayerStates = 9;

  state: PlayerStatus = 8;

  @Watch('iframeState')
  onStateChanged(newState: PlayerStates) {
    this.state = (() => {
      switch (newState) {
        case PlayerStates.BUFFERING:
          return PlayerStatus.BUFFERING;
        case PlayerStates.PLAYING:
          return PlayerStatus.PLAY;
        case PlayerStates.PAUSED:
          return PlayerStatus.PAUSE;
        case PlayerStates.ENDED:
          return PlayerStatus.END;
        case PlayerStates.UNSTARTED:
          return PlayerStatus.STOP;
        default:
          return PlayerStatus.ERROR;
      }
    })();
  }

  async getDuration() {
    return this.player.getDuration();
  }

  async setSpeed(s: number) {
    return this.player.setPlaybackRate(s);
  }
}
</script>

<style lang="scss" scoped>
.control-buttons {
  padding: 10px 0;

  button {
    margin-right: 10px;
  }
}
</style>
