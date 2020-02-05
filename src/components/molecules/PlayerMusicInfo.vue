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

const music = {
  platform: 'YouTube',
  source: 'https://www.youtube.com/embed/ALZHF5UqnU4',
  thumbnail: 'https://i.ytimg.com/vi/ALZHF5UqnU4/hqdefault.jpg',
  title: 'Marshmello - Alone (Official Music Video)',
  // title: 'Marshmello',
};

@Component
export default class PlayerMusicInfo extends Vue {
  @Prop({ default: null })
  public music!: Music | null;

  public marqueeEnable = false;

  @Watch('music', { immediate: true })
  private async decideMarqueeEnable() {
    await this.$nextTick();

    const el = this.$el.querySelector('.music-title') as HTMLElement;

    if (!music || !el) {
      return;
    }

    this.marqueeEnable = false;

    if (el.clientWidth > 200) {
      this.marqueeEnable = true;
      el.style.animationDuration = `${Math.ceil(el.clientWidth / 25)}s`;
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
