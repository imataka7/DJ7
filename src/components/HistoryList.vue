<template>
  <div class="history-list">
    <div class="history-item" v-for="m in list" :key="m.source">
      {{ m.platform }} | {{ m.source }}
      <button @click="add(m)">Add</button>
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
}
</script>

<style lang="scss" scoped>
.history-item {
  width: 600px;

  &:hover {
    background-color: #ddd;
  }
}
</style>
