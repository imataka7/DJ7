<template>
  <abutton class="share-button" @click="showPopup">
    Share on <fa-icon :icon="['fab', 'twitter']"></fa-icon>
  </abutton>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { ActionButton } from './molecules';

@Component({
  components: {
    abutton: ActionButton,
  },
})
export default class ShareButton extends Vue {
  @Prop({ default: 'general' })
  public roomId!: string;

  @Prop({ default: '' })
  public nowPlaying!: string;

  get link() {
    const baseUrl = 'https://twitter.com/intent/tweet';
    const text = `Share your moments on DJ7! I'm at ${this.roomId}!\n
${this.nowPlaying ? `Now playing ♫ ${this.nowPlaying}\n\n` : ''}`;
    const hashtags = `DJ7,DJ7_${this.roomId}`;
    const url = `https://www.dj7.io/${this.roomId}`;
    const related = 'dj7app,imataka7';
    return encodeURI(`${baseUrl}?text=${text}&hashtags=${hashtags}&url=${url}&related=${related}`);
  }

  public showPopup() {
    window.open(this.link);
  }
}
</script>
