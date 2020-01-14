<template>
  <div class="history-list">
    <music-list-item v-for="m in reversedList" :key="m.id" :music="m">
      <template v-slot:buttons>
        <button @click="add(m)">Add</button>
        <button @click="del(m)">Delete</button>
      </template>
    </music-list-item>
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
import MusicListItem from './molecules/MusicListItem.vue';

@Component({
  components: {
    MusicListItem,
  },
})
export default class HistoryList extends Vue {
  // @Prop({ default: () => [] })
  // value!: HistoryItem[];

  @Prop({ default: () => [] })
  list!: Music[];

  get reversedList() {
    return this.list.reverse();
  }

  public add(music: Music) {
    this.$emit('add', [{ ...music, id: generateRandomId() }]);
  }

  public del(music: Music) {
    this.$emit('del', music);
  }
}
</script>

<style lang="scss" scoped>
.history-list {
  width: 100%;

  button {
    font-size: 0.8em;
  }
}
</style>
