<template>
  <div class="history-list">
    <virtual-list :size="size" :remain="10" :key="size">
      <music-list-item v-for="m in reversedList" :key="m.source" :music="m">
        <template v-slot:buttons>
          <abutton class="button" title="Delete music" @click="del(m)">
            <fa-icon icon="times"></fa-icon>
          </abutton>
          <abutton
            class="button"
            title="Add to queue"
            @click="add(m)"
            v-if="role.addFromHistory"
          >
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
  Component, Vue, Prop,
} from 'vue-property-decorator';
// import VirtualList from 'vue-virtual-scroll-list';
import { Music, Role } from '@/models';
import { generateRandomId } from '@/utils';
import MusicListItem from './molecules/MusicListItem.vue';
import ActionButton from './molecules/ActionButton.vue';

const VirtualList = require('vue-virtual-scroll-list');

@Component({
  components: {
    MusicListItem,
    abutton: ActionButton,
    VirtualList,
  },
})
export default class HistoryList extends Vue {
  @Prop({ default: () => [] })
  list!: Music[];

  @Prop({ default: () => ({}) })
  role!: Role;

  get reversedList() {
    return [...this.list].reverse();
  }

  public log(action: string, music: Music) {
    this.$ga.logEvent(action);
    this.$logger.info(action, {
      content: {
        music,
      },
    });
  }

  public add(music: Music) {
    this.log('add_history', music);

    this.$emit('add', [{ ...music, id: generateRandomId() }]);
  }

  public del(music: Music) {
    this.log('delete_history', music);

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
  // overflow: hidden !important;
  overflow: auto;

  .button {
    margin: 0 10px;
  }
}
</style>
