<template>
  <div class="music-queue" :key="reloadKey">
    {{ isMobile }}
    <draggable
      :delay="isMobile ? 200 : 0"
      @start="dragging = true"
      @end="dragging = false"
      tag="div"
      class="draggable-list"
      v-model="queues"
    >
      <div
        :class="`draggable-item ${!dragging ? '' : ''}`"
        v-for="q in queues"
        :key="q.id"
      >
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

  get isMobile() {
    const mobiles = /Android|webOS|iPhone|iPad|iPod/i;
    return mobiles.test(window.navigator.userAgent);
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
