<template>
  <div>
    <button :disabled="disabled" aria-label="Sync" @click="sync" class="sairi-player-button">
      <fa-icon icon="sync-alt" size="lg"></fa-icon>
    </button>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';
import { PlayerStatus, Role } from '@/models';

@Component
export default class Sync extends Vue {
  @Prop({ default: PlayerStatus.NO_MUSIC })
  public currentStatus!: PlayerStatus;

  @Prop({ default: true })
  public disabled!: boolean;

  @Prop({ default: {} })
  role!: Role;

  public pause() {
    this.$emit('pause');
  }

  public play() {
    this.$emit('play');
  }

  public forward() {
    this.$emit('forward');
  }

  public sync(e: Event) {
    if (this.currentStatus !== PlayerStatus.PLAY) {
      return;
    }

    this.spinElement(e.currentTarget as HTMLElement);
    this.$emit('sync');
  }

  public spinElement(e: HTMLElement) {
    if (!e.animate) {
      return;
    }

    e.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], {
      duration: 300,
      easing: 'ease-in-out'
    });
  }
}
</script>

<style lang="scss" scoped>
.player-buttons {
  width: 120px;
}

.bounce-enter-active {
  animation: bounce-in 0.1s;
}

@keyframes bounce-in {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
