<template>
  <div class="music-list-item">
    <div v-if="role.queueSort" class="handle">
      <fa-icon icon="equals"></fa-icon>
    </div>
    <a
      class="img-link"
      target="_blank"
      rel="noopener noreferrer"
      :href="getUrl(music.source)"
      title="Watch on YouTube"
    >
      <img :src="music.thumbnail" alt="thumbnail" />
      <!-- <img v-lazy="music.thumbnail" alt="thumbnail" /> -->
    </a>
    <div class="desc-buttons">
      <div class="desc" :title="music.title">
        <p>
          <a
            class="original-link"
            target="_blank"
            rel="noopener noreferrer"
            :href="getUrl(music.source)"
          >
            <template v-if="music.extraStatus">*</template>
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
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Musicx, Role } from '@/models';

@Component
export default class MusicListItem extends Vue {
  @Prop()
  public music!: Musicx;

  @Prop({ default: () => ({}) })
  role!: Role;

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
  height: 80px;
  padding: 5px 0;
  font-family: "Roboto Mono", "Meiryo UI", monospace;
  transition: background 0.2s;
  background: var(--bgc);
}

.img-link {
  height: 100%;
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
      color: var(--fc);
      transition: color 0.2s;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

.buttons {
  display: flex;
  justify-content: flex-start;
  margin-top: 5px;
}

.handle {
  display: grid;
  place-items: center;
  width: 40px;
  height: 100%;
}

@media screen and (min-width: 1260px) {
  .music-list-item:hover {
    background: var(--list-item-bg-hover);
  }

  .original-link:hover {
    color: var(--list-item-link-fc-hover);
  }
}
</style>
