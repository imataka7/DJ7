<template>
  <div class="music-queue">
    <draggable
      @start="dragging = true"
      @end="dragging = false"
      tag="div"
      class="draggable-list"
      v-model="queues"
    >
      <div class="draggable-item" v-for="q in queues" :key="q.id">
        {{ q.source }} <span v-if="q.extraStatus">*</span>
        <button @click="del(q)">Delete</button>
        <button @click="interrupt(q)">Interrupt</button>
      </div>
    </draggable>
    <!-- <pre>{{ queues }}</pre> -->
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { Musicx } from '@/models/room';

@Component({
  components: {
    Draggable,
  },
})
export default class MusicQueue extends Vue {
  @Prop({ default: () => [] })
  value!: Musicx[];

  get queues() {
    return this.value;
  }

  set queues(newVal) {
    this.$emit('input', newVal);
  }

  public dragging = false;

  public del(music: Musicx) {
    const newQueue = this.queues.filter(q => q.id !== music.id);
    this.$emit('input', newQueue);
  }

  public interrupt(music: Musicx) {
    this.$emit('interrupt', music);
  }
}
</script>

<style lang="scss" scoped>
.music-queue {
  .draggable-item {
    width: 500px;

    &:hover {
      background-color: #ddd;
    }
  }
}
</style>
