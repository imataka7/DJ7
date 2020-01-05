<template>
  <div class="input-area">
    <textarea v-model="value"></textarea>
    <button @click="parse">Queue</button>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { getMusicInfo } from '@/utils/urlParser';

@Component
export default class InputArea extends Vue {
  public value = 'https://www.youtube.com/watch?v=fFSJiqNdbgU';

  public async parse() {
    // const queries = this.value.split('\n').map(getMusicInfo).filter(q => q !== null);
    const tasks = this.value.split('\n').map(getMusicInfo);
    const queries = (await Promise.all(tasks)).filter(q => q !== null);

    this.$emit('parsed', queries);

    this.value = '';
  }
}
</script>

<style lang="scss" scoped>
</style>
