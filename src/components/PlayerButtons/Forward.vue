<template>
  <div>
    <button
      class="sairi-player-button has-bounce"
      @click="forward"
      :disabled="currentStatus === 8"
      aria-label="Forward"
    >
      <fa-icon icon="forward" size="lg"></fa-icon>
    </button>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';
import { PlayerStatus } from '@/models';

@Component
export default class Forward extends Vue {
  @Prop({ default: PlayerStatus.NO_MUSIC })
  public currentStatus!: PlayerStatus;

  @Prop({ default: true })
  public disabled!: boolean;

  public forward() {
    this.$emit('forward');
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
