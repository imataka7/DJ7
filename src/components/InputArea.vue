<template>
  <div class="input-area">
    <div class="textarea-wrapper">
      <label>
        曲を追加
        <textarea
          v-model="value"
          :disabled="searching"
          :placeholder="isPlaylist ? playlistMessage : queryMessage"
        ></textarea>
      </label>
    </div>
    <div class="confirm-field">
      <label class="checkbox">
        <input type="checkbox" v-model="isPlaylist" />
        プレイリスト
      </label>
      <div class="add-buttons">
        <abutton class="button" @click="addRandom" :disabled="searching">
          ランダム
        </abutton>
        <abutton class="button" @click="parse" :disabled="searching">
          追加
        </abutton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue,
} from 'vue-property-decorator';
import {
  getMusicInfo, getPlaylistInfo, getPlaylistId, showToast, getRandomVideo,
} from '@/utils';
import { Musicx } from '@/models/room';
import ActionButton from './molecules/ActionButton.vue';
import { user } from '@/store/modules';

const queryMessage = '動画のURLか単語を入力して検索しよう';

const playlistMessage = 'プレイリストのURLを入力しよう';

@Component({
  components: {
    abutton: ActionButton,
  },
})
export default class InputArea extends Vue {
  public value = '';

  public isPlaylist = false;

  public queryMessage = queryMessage;

  public playlistMessage = playlistMessage;

  public searching = false;

  public log(type: 'video' | 'playlist', terms: string[]) {
    this.$ga.logEvent('search', {
      type,
      search_term: terms.join(', '),
    });

    this.$logger.info('search', {
      content: {
        type,
        terms,
      },
    });
  }

  public async searchAsQuery(queries: string[]) {
    this.log('video', queries);

    const musicList: Musicx[] = [];

    for (let i = 0; i < queries.length; i += 1) {
      // eslint-disable-next-line
      const searchResult = await getMusicInfo(queries[i]);

      if (searchResult) {
        musicList.push(searchResult);
      } else {
        showToast('error', `見つかりませんでした: ${queries[i]}`);
      }
    }

    return musicList;
  }

  public async searchAsPlaylist(queries: string[]) {
    this.log('playlist', queries);

    const ids = queries.map(getPlaylistId);

    const res = await Promise.all(ids.map(getPlaylistInfo));

    const musicList = (res.filter(m => m !== null) as Musicx[][]).flat();

    if (musicList.length === 0) {
      showToast('error', 'プレイリストが見つかりません');
    }

    return musicList;
  }

  public async parse() {
    this.searching = true;

    const queries = this.value.split('\n').filter(q => q !== '');

    if (queries.length === 0) {
      this.searching = false;
      return;
    }

    const musicList = this.isPlaylist
      ? await this.searchAsPlaylist(queries)
      : await this.searchAsQuery(queries);

    if (Array.isArray(musicList) && musicList.length) {
      this.$emit('parsed', musicList);
    }

    this.value = '';
    this.searching = false;
    this.isPlaylist = false;
  }

  get history() {
    return user.history || [];
  }

  public async addRandom() {
    this.searching = true;
    const m = await getRandomVideo(this.history);
    this.searching = false;
    this.$emit('parsed', [m]);
  }
}
</script>

<style lang="scss" scoped>
.input-area {
  width: 100%;
}

.textarea-wrapper {
  position: relative;
  width: calc(100% - 10px);
  // margin: 0 auto;

  textarea {
    width: 100%;
    min-height: 10em;
    border-radius: 3px;

    color: var(--input-fc);
    background: var(--input-bg);
    border-color: var(--input-border);

    &::placeholder {
      color: var(--input-placeholder-fc);
    }
  }
}

.confirm-field {
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  margin: 5px auto 0;

  .button {
    width: 80px;
  }
}

.add-buttons {
  button:not(:last-child) {
    margin-right: 10px;
  }
}
</style>
