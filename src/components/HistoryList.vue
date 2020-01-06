<template>
  <div class="history-list">
    <div class="history-item" v-for="m in list" :key="m.source">
      <!-- {{ m.platform }} | {{ m.source }} -->
      <img :src="m.thumbnail" alt="Thumbnail not found" />
      <div class="desc">
        <p class="b">{{ m.title }}</p>
        <p>{{ m.source }}</p>
        <div class="buttons">
          <button @click="add(m)">Add</button>
          <button @click="del(m)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import Music from '@/models/music';
import { Musicx } from '../models/room';
import { generateRandomId } from '@/utils/urlParser';

@Component
export default class HistoryList extends Vue {
  // @Prop({ default: () => [] })
  // value!: HistoryItem[];

  @Prop({ default: () => [] })
  list!: Music[];

  public add(music: Music) {
    this.$emit('add', [{ ...music, id: generateRandomId() }]);
  }

  public del(music: Music) {
    this.$emit('del', music);
  }
}
</script>

<style lang="scss" scoped>
.history-item {
  width: 800px;

  img {
    height: 100px;
    display: inline-block;
  }

  .desc {
    display: inline-block;
    margin-left: 10px;
    vertical-align: super;

    p {
      margin: 0;
      padding: 3px 0;

      &.b {
        font-weight: 700;
      }
    }

    .buttons {
      button {
        margin-right: 10px;
      }
    }
  }

  &:hover {
    background-color: #ddd;
  }
}
</style>
