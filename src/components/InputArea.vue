<template>
  <div class="input-area">
    <div class="textarea-wrapper">
      <textarea
        v-model="value"
        :disabled="searching"
        placeholder="Enter specific YouTube URLs or queries to search!"
      ></textarea>
    </div>
    <div class="confirm-field">
      <label class="checkbox" title="ごめん">
        <input type="checkbox" v-model="isPlaylist" disabled />
        Queue as playlist
      </label>
      <abutton class="button" @click="parse" :disabled="searching"
        >Queue</abutton
      >
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { getMusicInfo } from '@/utils/urlParser';
import { Musicx } from '@/models/room';
import ActionButton from './molecules/ActionButton.vue';

@Component({
  components: {
    abutton: ActionButton,
  },
})
export default class InputArea extends Vue {
  public value = '';

  public isPlaylist = false;

  public searching = false;

  public async parse() {
    this.searching = true;

    const queries = this.value.split('\n').filter(q => q !== '');

    if (queries.length === 0) {
      this.searching = false;
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
.input-area {
  width: 100%;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
  // min-height: 10em;

  textarea {
    min-width: calc(100% - 4px);
    min-height: 10em;
    border-radius: 3px;
    // padding: 0;
  }
}

.confirm-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;

  .button {
    width: 80px;
  }
}
</style>
