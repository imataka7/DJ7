<template>
  <div class="input-area">
    <textarea v-model="value" :disabled="searching"></textarea>
    <button @click="parse" :disabled="searching">Queue</button>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { getMusicInfo } from '@/utils/urlParser';
import { Musicx } from '@/models/room';

@Component
export default class InputArea extends Vue {
  public value = 'https://www.youtube.com/watch?v=fFSJiqNdbgU';

  public searching = false;

  public async parse() {
    this.searching = true;

    const queries = this.value.split('\n').filter(q => q !== '');

    if (queries.length === 0) {
      return;
    }

    const musicList: Musicx[] = [];

    for (let i = 0; i < queries.length; i += 1) {
      // eslint-disable-next-line
      const searchResult = await getMusicInfo(queries[i]);

      if (searchResult) {
        musicList.push(searchResult);
      }
    }
    // console.log(queries, musicList);

    this.$emit('parsed', musicList);

    this.value = '';
    this.searching = false;
  }
}
</script>

<style lang="scss" scoped>
</style>
