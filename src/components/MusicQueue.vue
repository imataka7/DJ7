<template>
  <div class="music-queue" :key="reloadKey">
    <draggable
      :delay="isMobile ? 200 : 0"
      @start="dragging = true"
      @end="dragging = false"
      tag="div"
      class="draggable-list"
      v-model="queues"
    >
      <music-list-item
        :class="`draggable-item ${!dragging ? '' : ''}`"
        v-for="q in queues"
        :key="q.id"
        :music="q"
      >
        <template v-slot:buttons>
          <abutton title="Delete" @click="del(q)">
            <fa-icon icon="times"></fa-icon>
          </abutton>
          <abutton title="Interrupt" @click="interrupt(q)">
            <fa-icon icon="hand-paper"></fa-icon>
          </abutton>
          <abutton
            title="Move to top"
            @click="moveToTop(q)"
            :disabled="!isDraggable"
          >
            <fa-icon icon="arrow-alt-circle-up"></fa-icon>
          </abutton>
        </template>
      </music-list-item>
    </draggable>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { Musicx } from '@/models/room';
import MusicListItem from './molecules/MusicListItem.vue';
import ActionButton from './molecules/ActionButton.vue';

@Component({
  components: {
    Draggable,
    MusicListItem,
    abutton: ActionButton,
  },
})
export default class MusicQueue extends Vue {
  @Prop({ default: () => [] })
  value!: Musicx[];

  @Watch('value')
  public onValueChanged(newVal: Musicx[]) {
    this.queueTemp = newVal;
  }

  @Prop({ default: false })
  isDraggable!: boolean;

  public reloadKey = Math.random();

  @Watch('isDraggable')
  public onChanged(val: boolean) {
    this.reloadKey = Math.random();
  }

  public dragging = false;

  public queueTemp: Musicx[] = [] ;

  get queues() {
    return this.queueTemp;
  }

  set queues(newVal) {
    this.queueTemp = newVal;
    this.$emit('input', newVal);
  }

  public mounted() {
    this.queueTemp = this.value;
  }

  public del(music: Musicx) {
    const newQueue = this.queues.filter(q => q.id !== music.id);
    this.$emit('input', newQueue);
  }

  public interrupt(music: Musicx) {
    this.$emit('interrupt', music);
  }

  public moveToTop(music: Musicx) {
    const newQueue = this.queues.filter(q => q.id !== music.id);

    newQueue.unshift(music);

    this.queues = newQueue;
  }

  get isMobile() {
    const mobiles = /Android|webOS|iPhone|iPad|iPod/i;
    return mobiles.test(window.navigator.userAgent);
  }
}
</script>

<style lang="scss" scoped>
.music-queue {
  width: 100%;

  button {
    font-size: 0.8em;
  }
}
</style>
