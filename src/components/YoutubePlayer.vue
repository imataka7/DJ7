<template>
  <div class="youtube-player player">
    <div class="video-player"></div>
    <div class="control-buttons">
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
      <button @click="end">skip</button>
      <button @click="changeVolume(10)">Volume +</button>
      <button @click="changeVolume(-10)">Volume -</button>
      <!-- <input type="text" v-model="query" />
      <button @click="cue">cue</button>
      <button @click="stop">stop</button> -->
      <span>{{ currentState }}</span>
    </div>
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
  @Prop({ default: '' })
  source!: string;

  @Prop({ default: '' })
  roomId!: string;

  public player!: YouTubePlayer;

  private async waitPlayerReady() {
    while (/-1|3|5|undefined/.test((await this.player.getPlayerState())?.toString(10))) {
      await new Promise(r => setTimeout(() => r(), 10));
      // console.log(await this.player.getPlayerState());
    }
  }

  // public async init() {
  //   const el = this.$el.querySelector('.video-player');
  //   this.player = YouTube(el as HTMLElement);

  //   // It's playable even when set `display: none`.
  //   // (await this.player.getIframe()).style.display = 'none';

  //   await this.player.cueVideoByUrl(this.source);
  //   this.player.on('stateChange', (e) => {
  //     // 0 means the video has ended
  //     if (e.data === 0) {
  //       this.end();
  //     }
  //   });

  //   await this.waitPlayerReady();
  //   console.log('initialized');
  // }

  public async init() {
    const el = this.$el.querySelector('.video-player');
    this.player = YouTube(el as HTMLElement);

    this.player.on('stateChange', async (e) => {
      this.currentState = e.data;
      // console.log(e, await this.getCurrentPlayedTime());
      if (e.data === 0) {
        this.end();
      }
    });

    // return new Promise<void>(async (r) => {
    //   const listener = this.player.on('stateChange', async (e) => {
    //     if (e.data === 1) {
    //       // await this.player.pauseVideo();
    //       r();
    //       // @ts-ignore
    //       this.player.off(listener);
    //     }
    //   });

    //   await this.player.loadVideoByUrl(this.source);
    // });
  }

  public async play() {
    this.$emit('update', PlayerStatus.PLAY, await this.player.getCurrentTime());
  }

  public async pause() {
    this.$emit('update', PlayerStatus.PAUSE, await this.player.getCurrentTime());
  }

  public async end() {
    this.$emit('end');
  }

  // FIXME: たまに更新したときにシークされない
  // なおったか？
  public async setStatus(status: PlayerStatus, seekTo: number) {
    await this.player.seekTo(seekTo, true);

    switch (status) {
      case PlayerStatus.PLAY:
        await this.player.playVideo();
        break;
      case PlayerStatus.PAUSE:
        await this.player.pauseVideo();
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

      await this.player.loadVideoByUrl(music.source);
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

  currentState: PlayerStates = 9;
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
