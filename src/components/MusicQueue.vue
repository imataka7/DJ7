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
        <img :src="q.thumbnail" alt="Thumbnail not found" />
        <div class="desc">
          <p class="b">{{ q.title }}</p>
          <p>{{ q.source }}</p>
          <div class="buttons">
            <button @click="del(q)">Delete</button>
            <button @click="interrupt(q)">Interrupt</button>
          </div>
        </div>
        <span v-if="q.extraStatus">*</span>
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
}
</style>
