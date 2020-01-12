<template>
  <div class="seek-bar">
    <orange-range
      v-model="range"
      :width="500"
      @change="seeked"
      :disabled="disabled"
    ></orange-range>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import OrangeRange from './atoms/OrangeRange.vue';

@Component({
  components: {
    OrangeRange,
  },
})
export default class SeekBar extends Vue {
  @Prop({ default: 0 })
  public value!: number;

  get range() {
    return Math.floor(this.value) || 0;
  }

  set range(time: number) {
    this.$emit('input', time);
  }

  @Prop({ default: false })
  public disabled!: boolean;

  public seeked() {
    this.$emit('seeked', this.value);
  }
}
</script>

<style lang="scss" scoped>
</style>
