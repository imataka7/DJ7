<template>
  <abutton class="share-button" @click="showPopup">
    Share on <fa-icon :icon="['fab', 'twitter']"></fa-icon>
  </abutton>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop,
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

    const roomId = encodeURIComponent(this.roomId);
    const playing = this.nowPlaying ? `Now playing ♫ ${this.nowPlaying}\n\n` : '';

    const text = encodeURIComponent(`Share your moments on DJ7! I'm at ${this.roomId}!\n\n${playing}`);
    const hashtags = `DJ7,DJ7_${roomId},NowPlaying`;
    const url = `https://dj7.io/${roomId}`;
    const related = 'dj7app,imataka7';

    return `${baseUrl}?hashtags=${hashtags}&url=${url}&related=${related}&text=${text}`;
  }

  public showPopup() {
    this.$ga.logEvent('share', {
      method: 'Twitter',
    });
    this.$logger.info('share', {
      roomId: this.roomId,
      content: {
        link: this.link,
      },
    });

    window.open(this.link);
  }
}
</script>
