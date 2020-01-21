<template>
  <div class="history-list">
    <!-- <p>{{ size }}</p> -->
    <virtual-list :size="size" :remain="10" :key="size">
      <music-list-item v-for="m in reversedList" :key="m.id" :music="m">
        <template v-slot:buttons>
          <abutton class="button" title="Delete music" @click="del(m)">
            <fa-icon icon="times"></fa-icon>
          </abutton>
          <abutton class="button" title="Add to queue" @click="add(m)">
            <fa-icon icon="plus"></fa-icon>
          </abutton>
        </template>
      </music-list-item>
    </virtual-list>
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
import ActionButton from './molecules/ActionButton.vue';

@Component({
  components: {
    MusicListItem,
    abutton: ActionButton,
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

  public size = 100;

  public mounted() {
    this.size = this.$el.clientHeight / 10;
  }
}
</script>

<style lang="scss" scoped>
.history-list {
  width: 100%;
  padding: 0 5px;
  overflow: hidden;

  .button {
    margin: 0 10px;
  }
}
</style>
