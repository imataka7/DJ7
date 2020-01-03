<template>
  <div class="youtube-player player">
    <div class="video-player"></div>
    <div class="control-buttons">
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
      <button @click="end">skip</button>
      <button @click="changeVolume(10)">Volume +</button>
      <button @click="changeVolume(-10)">Volume -</button>
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
import PlayerStatus from '@/models/playerStatus';

@Component
export default class PlayerYoutube extends Vue {
  @Prop({ default: '' })
  source!: string;

  @Prop({ default: '' })
  roomId!: string;

  public player!: YouTubePlayer;

  private async waitPlayerReady() {
    while (/-1|3|5|undefined/.test((await this.player.getPlayerState())?.toString(10))) {
      await new Promise(r => setTimeout(() => r(), 10));
    //   console.log(await this.player.getPlayerState());
    }
  }

  public async init() {
    const el = this.$el.querySelector('.video-player');
    this.player = YouTube(el as HTMLElement);
    this.player.loadVideoByUrl(this.source);
    this.player.on('stateChange', (e) => {
      if (e.data === 0) {
        this.end();
      }
    });

    await this.waitPlayerReady();
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

  public async changeVolume(level: number) {
    const currentVolume = await this.player.getVolume();
    this.player.setVolume(currentVolume + level);
  }
}
</script>

<style lang="scss" scoped>
</style>
