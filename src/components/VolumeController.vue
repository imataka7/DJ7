<template>
  <div
    class="volume-controller"
    @mouseenter="isVolumePickerActive = true"
    @mouseleave="hidePicker"
  >
    <button @click="toggleMute" aria-label="Volume" class="sairi-player-button">
      <fa-icon :icon="speakerIcon" size="lg"></fa-icon>
    </button>
    <transition name="fade">
      <volume-picker
        v-model="currentVolume"
        v-if="isVolumePickerActive"
      ></volume-picker>
    </transition>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';
import VolumePicker from './VolumePicker.vue';
import { sleep } from '@/utils';

@Component({
  components: {
    VolumePicker,
  },
})
export default class VolumeController extends Vue {
  @Prop({ default: 0 })
  public value!: number;

  get currentVolume() {
    return this.value;
  }

  set currentVolume(v: number) {
    this.$emit('input', v);
  }

  public isVolumePickerActive = false;

  public async hidePicker() {
    await sleep(200);

    if (!this.$el.matches(':hover')) {
      this.isVolumePickerActive = false;
    }
  }

  public toggleMute() {
    this.$ga.logEvent('toggle_mute');

    if (this.currentVolume === 0) {
      const vol = localStorage.getItem('volume') || '30';
      this.currentVolume = parseInt(vol, 10);
    } else {
      const prevVolume = this.currentVolume;
      this.currentVolume = 0;
      // Make sure to work `setItem` after `onVolumeChanged`
      Promise.resolve().then(() => {
        localStorage.setItem('volume', prevVolume.toString(10));
      });
    }
  }

  get speakerIcon() {
    if (this.currentVolume === 0) {
      return 'volume-mute';
    }

    if (this.currentVolume > 0 && this.currentVolume < 60) {
      return 'volume-down';
    }

    return 'volume-up';
  }
}
</script>

<style lang="scss" scoped>
.volume-controller {
  display: flex;
  align-items: center;
  position: relative;
  width: 35px;
  z-index: 100;
}

.volume-picker {
  position: absolute;
  bottom: 400%;
  right: -210%;
}
</style>
