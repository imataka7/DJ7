<template>
  <div class="youtube-player player">
    <div class="video-player"></div>
    <div class="control-buttons">
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
      <button @click="changeVolume(10)">Volume +</button>
      <button @click="changeVolume(-10)">Volume -</button>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import YouTube from 'youtube-player';
import { YouTubePlayer } from 'youtube-player/dist/types';
import PlayerStatus from '@/models/playerStatus';

@Component
export default class PlayerYoutube extends Vue {
  @Prop({ default: '' })
  videoUrl!: string;

  public async mounted() {
    const el = this.$el.querySelector('.video-player');
    const player = YouTube(el as HTMLElement);
    player.loadVideoByUrl(this.videoUrl);
    player.stopVideo();

    this.player = player;
  }

  private player!: YouTubePlayer;

  public play() {
    this.player.playVideo();
    this.$emit('update', PlayerStatus.PLAY);
  }

  public pause() {
    this.player.pauseVideo();
    this.$emit('update', PlayerStatus.STOP);
  }

  public async changeVolume(level: number) {
    const currentVolume = await this.player.getVolume();
    this.player.setVolume(currentVolume + level);
  }
}
</script>

<style lang="scss" scoped>
</style>
