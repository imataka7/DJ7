<template>
  <div class="orange-range">
    <div
      class="range-runnable-track"
      :style="`width: ${(width * val) / 100}px`"
    ></div>
    <input type="range" class="input-range" v-model.number="val" />
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
  padding-bottom: 7px;
  width: 150px;
}

.input-range[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: #bbb;
  height: 2px;
  width: 100%;

  &:focus,
  &:active {
    outline: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    position: relative;
    border: none;
    width: 12px;
    height: 12px;
    display: block;
    background-color: #f50;
    border-radius: 50%;
    -webkit-border-radius: 50%;
  }
}

.is-vertical {
  transform: rotate(-90deg);
}

.range-runnable-track {
  position: absolute;
  height: 2px;
  width: 100%;
  background-color: #f50;
  top: 27px;
}
</style>
