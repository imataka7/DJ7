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

  public async mounted() {
    const el = this.$el.querySelector('.video-player');
    const player = YouTube(el as HTMLElement);
    await player.loadVideoByUrl(this.videoUrl);
    player.stopVideo();

    this.player = player;

    controllers.updateController({
      roomId: this.roomId,
      controller: {
        play: this.play,
        pause: this.pause,
        setStatus: this.setStatus,
      },
    });
    console.log('call');
  }

  public player!: YouTubePlayer;

  public async play() {
    this.$emit('update', PlayerStatus.PLAY, await this.player.getCurrentTime());
  }

  public async pause() {
    this.$emit('update', PlayerStatus.PAUSE, await this.player.getCurrentTime());
  }

  public async setStatus(status: PlayerStatus, seekTo: number) {
    await this.$nextTick();

    switch (status) {
      case PlayerStatus.PLAY:
        await this.player.playVideo();
        break;
      case PlayerStatus.PAUSE:
        await this.player.pauseVideo();
        break;
      default:
    }

    await this.player.seekTo(seekTo, true);
    console.log(status, seekTo, await this.player.getPlayerState());
  }

  public async changeVolume(level: number) {
    const currentVolume = await this.player.getVolume();
    this.player.setVolume(currentVolume + level);
  }
}
</script>

<style lang="scss" scoped>
</style>
