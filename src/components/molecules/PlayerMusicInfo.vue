<template>
  <div class="player-music-info">
    <img :src="music.thumbnail" alt="thumbnail" class="thumbnail" />
    <span class="music-title">{{ music.title }}</span>
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
};

@Component
export default class PlayerMusicInfo extends Vue {
  @Prop({ default: () => music })
  public music!: Music;
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

.music-title {
  width: 200px;
  font-family: "Roboto Mono", monospace;
  text-overflow: ellipsis;
}
</style>
