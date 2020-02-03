<template>
  <div class="player-music-info" :key="music.source">
    <img :src="music.thumbnail" alt="thumbnail" class="thumbnail" />
    <div class="music-title-wrapper">
      <div ref="title" :class="`music-title ${marqueeEnable ? 'marquee' : ''}`">
        {{ music.title }}
      </div>
    </div>
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
  @Prop({ default: () => music })
  public music!: Music;

  public marqueeEnable = false;

  @Watch('music')
  private async decideMarqueeEnable() {
    const el = this.$el.querySelector('.music-title') as HTMLElement;

    if (el.classList.contains('marquee')) {
      el.classList.remove('marquee');
    }

    if (!el) {
      return;
    }

    await this.$nextTick();

    if (el.clientWidth > 200) {
      this.marqueeEnable = true;
      el.style.animationDuration = `${el.clientWidth * 10 / 350}s`;
    } else {
      this.marqueeEnable = false;
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
  // height: 40px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  // box-shadow: 0px 0px 6px 3px #ddd inset;

  // &:hover > .marquee {
  //   padding-left: 100%;
  //   animation: marquee 10s linear infinite;
  // }
}

.music-title {
  display: inline-block;
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
