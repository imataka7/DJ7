<template>
  <div class="volume-picker is-vertical">
    <orange-range v-model="volume"></orange-range>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';
import OrangeRange from './RangeBar.vue';

@Component({
  components: {
    OrangeRange,
  },
})
export default class VolumePicker extends Vue {
  @Prop({ default: 0 })
  public value!: number;

  get volume() {
    return this.value;
  }

  set volume(vol: number) {
    this.$emit('input', vol);
  }
}
</script>

<style lang="scss" scoped>
.volume-picker {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: var(--volume-picker-bg);
  padding: 15px;
  width: 180px;
  box-sizing: border-box;
  border: solid 1px var(--volume-picker-border);

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 10px 10px 0;
    border-color: transparent var(--volume-picker-bg) transparent transparent;
    filter: drop-shadow(-1px 0px 0px var(--volume-picker-shadow));
  }
}

.is-vertical {
  transform: rotate(-90deg);
}
</style>
