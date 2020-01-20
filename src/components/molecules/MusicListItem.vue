<template>
  <div class="music-list-item">
    <a
      class="img-link"
      target="_blank"
      rel="noopener noreferrer"
      :href="getUrl(music.source)"
      title="Watch on YouTube"
    >
      <!-- <img :src="music.thumbnail" alt="thumbnail" /> -->
      <img v-lazy="music.thumbnail" alt="thumbnail" />
    </a>
    <div class="desc-buttons">
      <div class="desc" :title="music.title">
        <p>
          <template v-if="music.extraStatus">
            *
          </template>
          <a
            class="original-link"
            target="_blank"
            rel="noopener noreferrer"
            :href="getUrl(music.source)"
          >
            {{ music.title }}
          </a>
        </p>
      </div>
      <div class="buttons">
        <slot name="buttons"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { Musicx } from '../../models/room';

@Component
export default class MusicListItem extends Vue {
  @Prop()
  public music!: Musicx;

  public getUrl(url: string) {
    const videoId = url.replace('https://www.youtube.com/embed/', '');

    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
</script>

<style lang="scss" scoped>
.music-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 5px 0;
  font-family: "Roboto Mono", "Meiryo UI", monospace;
  transition: background 0.2s;

  &:hover {
    background: #eee;
  }
}

.img-link {
  height: 80px;
  width: 106.66px;
  margin-right: 10px;

  img {
    height: 100%;
    margin: auto;
  }
}

.desc-buttons {
  flex: 2;
}

.desc {
  height: 2.5em;
  overflow: hidden;

  p {
    line-height: 1.25em;
    margin: 0;
    white-space: normal;
    text-overflow: ellipsis;

    .original-link {
      color: #000;
      transition: color 0.2s;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;

      &:hover {
        color: #f50;
      }
    }
  }
}

.buttons {
  display: flex;
  justify-content: flex-start;
  margin-top: 5px;
}
</style>
