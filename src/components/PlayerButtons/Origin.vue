<template>
  <div class="player-buttons is-flex">
    <transition name="bounce" mode="out-in" v-if="role.playerPause">
      <button
        @click="pause"
        v-if="currentStatus === 1"
        key="pause"
        :disabled="disabled"
        aria-label="Pause"
        class="sairi-player-button"
      >
        <fa-icon icon="pause" size="lg"></fa-icon>
      </button>
      <button
        @click="play"
        v-else
        key="play"
        :disabled="disabled"
        aria-label="Play"
        class="sairi-player-button"
      >
        <fa-icon icon="play" size="lg"></fa-icon>
      </button>
    </transition>

    <button
      v-if="role.playerSkip"
      class="sairi-player-button has-bounce"
      @click="forward"
      :disabled="currentStatus === 8"
      aria-label="Forward"
    >
      <fa-icon icon="forward" size="lg"></fa-icon>
    </button>

    <button
      :disabled="disabled"
      aria-label="Sync"
      @click="sync"
      class="sairi-player-button"
    >
      <fa-icon icon="sync-alt" size="lg"></fa-icon>
    </button>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';
import { PlayerStatus, Role } from '@/models';

@Component
export default class PlayerButtons extends Vue {
  @Prop({ default: PlayerStatus.NO_MUSIC })
  public currentStatus!: PlayerStatus;

  @Prop({ default: true })
  public disabled!: boolean;

  @Prop({ default: () => ({}) })
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
      easing: 'ease-in-out',
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
