<template>
  <div class="draggable-list">
    <Container @drop="onDrop" drag-handle-selector=".handle">
      <Draggable
        v-for="q in queue"
        :key="q.id"
      >
        <music-list-item
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
            >
              <fa-icon icon="arrow-alt-circle-up"></fa-icon>
            </abutton>
          </template>
        </music-list-item>
      </Draggable>
    </Container>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Container, Draggable, DropResult } from 'vue-smooth-dnd';
import { Musicx, Role } from '@/models';
import MusicListItem from './molecules/MusicListItem.vue';
import ActionButton from './molecules/ActionButton.vue';

@Component({
  components: {
    Container,
    Draggable,
    MusicListItem,
    abutton: ActionButton,
  },
})
export default class DraggableList extends Vue {
  public onDrop({ removedIndex, addedIndex }: DropResult) {
    if (removedIndex === null || addedIndex === null) return;

    const result = [...this.queue];
    const [itemToAdd] = result.splice(removedIndex, 1);
    result.splice(addedIndex, 0, itemToAdd);

    this.queue = result;
  }

  @Prop({ default: () => [] })
  value!: Musicx[];

  @Prop({ default: () => ({}) })
  role!: Role;

  get queue() {
    return this.value;
  }

  set queue(q) {
    this.$ga.logEvent('drag');

    this.$emit('input', q);
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

    const newQueue = this.queue.filter(q => q.id !== music.id);
    this.$emit('input', newQueue);
  }

  public interrupt(music: Musicx) {
    this.log('interrupt', music);

    this.$emit('interrupt', music);
  }

  public moveToTop(music: Musicx) {
    this.log('move_to_top', music);

    const newQueue = this.queue.filter(q => q.id !== music.id);

    newQueue.unshift(music);

    this.queue = newQueue;
  }

  get isMobile() {
    const mobiles = /Android|webOS|iPhone|iPad|iPod/i;
    return mobiles.test(window.navigator.userAgent);
  }
}
</script>

<style lang="scss" scoped>
.draggable-list {
  width: 100%;

  .button {
    margin: 0 10px;
  }

  &.is-flash {
    animation: flash 1.5s ease;
  }
}

@keyframes flash {
  0% {
    box-shadow: 0 0 10px 0 #f50 inset;
  }

  100% {
    box-shadow: none;
  }
}
</style>
