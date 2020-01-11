<template>
  <div class="seek-bar">
    <p>2:56 / 3:48</p>
    <orange-range v-model="range" :width="500" @change="seeked"></orange-range>
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

  get playedTime() {
    return this.value;
  }

  set playedTime(time: number) {
    this.$emit('input', time);
  }

  @Prop({ default: false })
  public disabled!: boolean;

  public range = 0;

  public seeked() {
    this.$emit('seeked', this.playedTime);
  }
}
</script>

<style lang="scss" scoped>
.seek-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;

  p {
    font-family: "Roboto Mono", monospace;
    padding-top: 3px;
    margin-right: 30px;
  }
}
</style>
