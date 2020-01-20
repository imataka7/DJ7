<template>
  <div class="input-area">
    <div class="textarea-wrapper">
      <textarea
        v-model="value"
        :disabled="searching"
        :placeholder="isPlaylist ? playlistMessage : queryMessage"
      ></textarea>
    </div>
    <div class="confirm-field">
      <label class="checkbox">
        <input type="checkbox" v-model="isPlaylist" />
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
import { getMusicInfo, getPlaylistInfo, getPlaylistId } from '@/utils/urlParser';
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

  public queryMessage = 'Enter specific YouTube URLs or queries to search!';

  public playlistMessage = 'Enter playlist URLs or playlistIds!'

  public searching = false;

  public async searchAsQuery() {
    const queries = this.value.split('\n').filter(q => q !== '');

    if (queries.length === 0) {
      return null;
    }

    const musicList: Musicx[] = [];

    for (let i = 0; i < queries.length; i += 1) {
      // eslint-disable-next-line
      const searchResult = await getMusicInfo(queries[i]);

      if (searchResult) {
        musicList.push(searchResult);
      }
    }

    return musicList;
  }

  public async searchAsPlaylist() {
    const params = this.value.split('\n').filter(q => q !== '');

    if (params.length === 0) {
      return null;
    }

    const ids = params.map(getPlaylistId);

    const musicList = await Promise.all(ids.map(getPlaylistInfo));

    return (musicList.filter(m => m !== null) as Musicx[][]).flat();
  }

  public async parse() {
    this.searching = true;

    const musicList = this.isPlaylist ? await this.searchAsPlaylist() : await this.searchAsQuery();

    // console.log(musicList);

    this.$emit('parsed', musicList);

    this.value = '';
    this.searching = false;
    this.isPlaylist = false;
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
    margin: 0 auto;
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

@media screen and (max-width: 480px) {
  textarea {
    min-width: 0 !important;
    width: 85vw;
    height: 10em;
  }
}
</style>
