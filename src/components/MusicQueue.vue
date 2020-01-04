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
        {{ q.source }}
        <button @click="del(q.id)">Delete</button>
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

  public del(id: string) {
    const newQueue = this.queues.filter(q => q.id !== id);
    this.$emit('input', newQueue);
  }
}
</script>

<style lang="scss" scoped>
.music-queue {
  .draggable-item {
    width: 500px;
    background-color: #ddd;
  }
}
</style>
