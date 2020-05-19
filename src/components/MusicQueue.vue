<template>
  <div :class="`music-queue ${isFlash ? 'is-flash' : ''}`" :key="reloadKey">
    <draggable
      :delay="isMobile ? 200 : 0"
      @start="dragging = true"
      @end="dragging = false"
      tag="div"
      class="draggable-list"
      v-model="queues"
      :disabled="!role.queueSort"
    >
      <music-list-item
        :class="`draggable-item ${!dragging ? '' : ''}`"
        v-for="q in queues"
        :key="q.id"
        :music="q"
        :role="role"
      >
        <template v-slot:buttons>
          <abutton
            v-if="role.queueDelete"
            class="button"
            title="Delete"
            @click="del(q)"
          >
            <fa-icon icon="times"></fa-icon>
          </abutton>
          <abutton
            v-if="role.queueInterrupt"
            class="button"
            title="Interrupt"
            @click="interrupt(q)"
          >
            <fa-icon icon="hand-paper"></fa-icon>
          </abutton>
          <abutton
            v-if="role.queueMoveToTop"
            class="button"
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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { Musicx, Role } from '@/models';
import MusicListItem from './molecules/MusicListItem.vue';
import ActionButton from './molecules/ActionButton.vue';

@Component({
  components: {
    Draggable,
    MusicListItem,
    abutton: ActionButton,
  },
})
// TODO: Refactor
export default class MusicQueue extends Vue {
  @Prop({ default: () => [] })
  value!: Musicx[];

  @Prop({ default: () => ({}) })
  role!: Role;

  @Watch('value')
  public onValueChanged(newVal: Musicx[]) {
    this.queueTemp = newVal;
  }

  @Prop({ default: false })
  isDraggable!: boolean;

  public reloadKey = Math.random();

  public isFlash = false;

  @Watch('isDraggable')
  public onChanged() {
    this.reloadKey = Math.random();
  }

  public dragging = false;

  public queueTemp: Musicx[] = [];

  @Watch('queueTemp')
  public onQueueChanged(newval: Musicx[], oldval: Musicx[]) {
    if (newval.length > oldval.length) {
      this.isFlash = true;
      setTimeout(() => {
        this.isFlash = false;
      }, 1000);
    }
  }

  get queues() {
    return this.queueTemp;
  }

  set queues(newVal) {
    this.$ga.logEvent('drag');

    this.queueTemp = newVal;
    this.$emit('input', newVal);
  }

  public mounted() {
    this.queueTemp = this.value;
  }

  public log(action: string, music: Musicx) {
    this.$ga.logEvent(action);
    this.$logger.info(action, {
      content: {
        music,
      },
    });
  }

  public del(music: Musicx) {
    this.log('delete_queue', music);

    const newQueue = this.queues.filter(q => q.id !== music.id);
    this.$emit('input', newQueue);
  }

  public interrupt(music: Musicx) {
    this.log('interrupt', music);

    this.$emit('interrupt', music);
  }

  public moveToTop(music: Musicx) {
    this.log('move_to_top', music);

    const newQueue = this.queues.filter(q => q.id !== music.id);

    newQueue.unshift(music);

    this.queues = newQueue;
  }

  get isMobile() {
    const mobiles = /Android|webOS|iPhone|iPad|iPod/i;
    return mobiles.test(window.navigator.userAgent);
  }

  public dragOptions = {
    //  animation: 100,
    group: 'queue',
    disabled: this.isDraggable,
    ghostClass: 'ghost',
  };
}
</script>

<style lang="scss" scoped>
.music-queue {
  width: 100%;
  min-height: calc(100% - 20px);
  padding: 0 5px;
  touch-action: pan-y;

  .button {
    margin: 0 10px;
  }

  &.is-flash {
    animation: flash 1.5s ease;
  }
}

// .flip-list-move {
//   transition: transform 0.2s;
// }

// .no-move {
//   transition: transform 0s;
// }

// .ghost {
//   opacity: 0.5;
//   background: #c8cbfb;
// }

@keyframes flash {
  0% {
    box-shadow: 0 0 10px 0 #f50 inset;
  }

  100% {
    box-shadow: none;
  }
}
</style>
