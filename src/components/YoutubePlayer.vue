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
import controllers from '@/store/modules/controllers';

@Component
export default class PlayerYoutube extends Vue {
  @Prop({ default: '' })
  videoUrl!: string;

  @Prop({ default: '' })
  roomId!: string;

  public async init() {
    const el = this.$el.querySelector('.video-player');
    const player = YouTube(el as HTMLElement);
    await player.loadVideoByUrl(this.videoUrl);
    // stopだと読み込みが行われないかも
    // また、頭出しされてしまうかも
    await player.pauseVideo();

    this.player = player;

    controllers.updateController({
      roomId: this.roomId,
      controller: {
        play: this.play,
        pause: this.pause,
        setStatus: this.setStatus,
      },
    });
  }

  public player!: YouTubePlayer;

  public async play() {
    this.$emit('update', PlayerStatus.PLAY, await this.player.getCurrentTime());
  }

  public async pause() {
    this.$emit('update', PlayerStatus.PAUSE, await this.player.getCurrentTime());
  }

  public async setStatus(status: PlayerStatus, seekTo: number) {
    switch (status) {
      case PlayerStatus.PLAY:
        await this.player.playVideo();
        break;
      case PlayerStatus.PAUSE:
        await this.player.pauseVideo();
        break;
      default:
    }

    const start = performance.now();
    // eslint-disable-next-line
    while (await this.player.getPlayerState() !== 1) {
      // eslint-disable-next-line
      await new Promise(r => setTimeout(() => r(), 100));
    }

    await this.player.seekTo(seekTo + (performance.now() - start) / 1000, true);
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
