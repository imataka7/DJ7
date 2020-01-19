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
      },
    });

    if (this.isMobile) {
      this.player.mute();
    }

    // It's playable even when set `display: none`.
    // (await this.player.getIframe()).style.display = 'none';

    this.player.on('stateChange', async (e) => {
      this.state = e.data;
      // console.log(e, await this.getCurrentPlayedTime());
      if (e.data === 0) {
        this.end();
      }
    });
  }

  public async play() {
    // if (this.state === PlayerStatus.BUFFERING) {
    //   return;
    // }

    // this.$emit('update', PlayerStatus.PLAY, await this.player.getCurrentTime());
    this.player.playVideo();
  }

  public async pause() {
    // if (this.state === PlayerStatus.BUFFERING) {
    //   return;
    // }

    // this.$emit('update', PlayerStatus.PAUSE, await this.player.getCurrentTime());
    this.player.pauseVideo();
  }

  public async end() {
    this.$emit('end');
  }

  // FIXME: たまに更新したときにシークされない
  // なおったか？
  /**
   * @deprecated
   */
  public async setStatus(status: PlayerStatus, seekTo: number) {
    await this.player.seekTo(seekTo, true);

    switch (status) {
      case PlayerStatus.PLAY:
        await this.player.playVideo();
        break;
      case PlayerStatus.PAUSE:
        await this.player.pauseVideo();
        break;
      case PlayerStatus.NO_MUSIC:
        await this.player.stopVideo();
        break;
      default:
    }

    // console.log(await this.player.getPlayerState());
    // console.log(status, seekTo, await this.player.getPlayerState());
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

  async loadMusic(music: Music): Promise<void> {
    return new Promise<void>(async (r) => {
      const listener = this.player.on('stateChange', async (e) => {
        if (e.data === 1) {
          // await this.player.pauseVideo();
          r();
          // @ts-ignore
          this.player.off(listener);
        }
      });

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
