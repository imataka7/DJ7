<template>
  <div class="orange-range">
    <div
      class="range-runnable-track"
      :style="`width: ${val}%`"
      v-if="!disabled"
    ></div>
    <input
      type="range"
      class="input-range"
      v-model.number="val"
      :disabled="disabled"
      min="0"
      max="100"
      step="0.1"
      @change="$emit('change', val)"
    />
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';

@Component
export default class OrangeRange extends Vue {
  @Prop({ default: 0 })
  public value!: number;

  @Prop({ default: false })
  public disabled!: boolean;

  get val() {
    return this.value;
  }

  set val(newVal) {
    this.$emit('input', newVal);
  }
}
</script>

<style lang="scss" scoped>
.orange-range {
  position: relative;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  --range-color: #f50;
}

.input-range[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: #bbb;
  height: 2px;
  width: 100%;
  cursor: pointer;

  &:focus,
  &:active {
    outline: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    position: relative;
    border: none;
    width: 12px;
    height: 12px;
    display: block;
    background-color: var(--range-color);
    border-radius: 50%;
    -webkit-border-radius: 50%;
  }

  &:disabled {
    filter: grayscale(100%);
    cursor: not-allowed;
  }
}

.is-vertical {
  transform: rotate(-90deg);
}

.range-runnable-track {
  position: absolute;
  height: 2px;
  width: 100%;
  background-color: var(--range-color);
}
</style>
