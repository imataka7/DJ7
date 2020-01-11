<template>
  <div class="orange-range" :style="`width: ${width}px;`">
    <div
      class="range-runnable-track"
      :style="`width: ${(width * val) / 100}px`"
      v-if="!disabled"
    ></div>
    <input
      type="range"
      class="input-range"
      v-model.number="val"
      :disabled="disabled"
      @change="$emit('change', val)"
    />
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';

@Component
export default class OrangeRange extends Vue {
  @Prop({ default: 0 })
  public value!: number;

  @Prop({ default: 150 })
  public width!: number;

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
  padding-bottom: 9px;
  width: 150px;

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
  top: 13px;
}
</style>
