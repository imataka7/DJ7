<template>
  <div class="player-music-info">
    <template v-if="music">
      <img :src="music.thumbnail" alt="thumbnail" class="thumbnail" />
      <div class="music-title-wrapper">
        <div
          ref="title"
          :class="`music-title ${marqueeEnable ? 'marquee' : ''}`"
        >
          {{ music.title }}
        </div>
      </div>
    </template>
    <p class="no-music-indicator" v-else>No music playing</p>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import Music from '../../models/music';

@Component
export default class PlayerMusicInfo extends Vue {
  @Prop({ default: null })
  public music!: Music | null;

  public marqueeEnable = false;

  @Watch('music')
  private async decideMarqueeEnable() {
    await this.$nextTick();

    const el = this.$el.querySelector('.music-title') as HTMLElement;

    if (!this.music || !el) {
      return;
    }

    this.marqueeEnable = false;

    if (el.clientWidth > 200) {
      const duration = Math.ceil((240 + el.clientWidth) / 50);
      el.style.animationDuration = `${duration}s`;
      this.marqueeEnable = true;
    }
  }

  public mounted() {
    this.decideMarqueeEnable();
  }
}
</script>

<style lang="scss" scoped>
.player-music-info {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.thumbnail {
  height: 40px;
  margin-right: 10px;
}

.music-title-wrapper {
  width: 200px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.music-title {
  display: inline-block;
}

.no-music-indicator {
  text-align: center;
}

.marquee {
  padding-left: 120%;
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translate(0%);
  }

  100% {
    transform: translate(-100%);
  }
}
</style>
