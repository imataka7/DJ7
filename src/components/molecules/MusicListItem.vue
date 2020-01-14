<template>
  <div class="music-list-item">
    <img :src="music.thumbnail" alt="thumbnail" />
    <div class="desc-buttons">
      <div class="desc" :title="music.title">
        <p>
          <template v-if="music.extraStatus">
            *
          </template>
          {{ music.title }}
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

  &:hover {
    background-color: #ddd;
  }
}

img {
  height: 80px;
  margin-right: 10px;
}

.desc-buttons {
  flex: 2;
}

.desc {
  height: 2.5em;
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;

  p {
    line-height: 1.25em;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.buttons {
  margin-top: 5px;

  button {
    margin-right: 10px;
  }
}
</style>
