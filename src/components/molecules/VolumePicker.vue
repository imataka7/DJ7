<template>
  <div class="volume-picker is-vertical">
    <orange-range v-model="volume"></orange-range>
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
  background-color: #eee;
  padding: 15px;
  width: 180px;
  box-sizing: border-box;
  border: solid 1px #bbb;

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
    border-color: transparent #eee transparent transparent;
    filter: drop-shadow(-1px 0px 0px #aaa);
  }
}

.is-vertical {
  transform: rotate(-90deg);
}
</style>
