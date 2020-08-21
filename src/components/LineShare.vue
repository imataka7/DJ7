<template>
  <abutton @click="open">
    <fa-icon :icon="['fab', 'line']" size="lg"></fa-icon> シェア
  </abutton>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ActionButton } from '@/components/molecules';

@Component({
  components: {
    abutton: ActionButton,
  },
})
export default class LineShare extends Vue {
  @Prop({ default: 'general' })
  public roomId!: string;

  get currentUrl() {
    return `https://dj7.io/${this.roomId}`;
  }

  get shareLink() {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(this.currentUrl)}`;
  }

  public open() {
    window.open(this.shareLink);
  }
}
</script>
