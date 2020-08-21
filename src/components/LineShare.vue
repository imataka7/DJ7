<template>
  <abutton @click="open">
    <fa-icon :icon="['fab', 'line']"></fa-icon> シェア
  </abutton>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue } from 'vue-property-decorator';
import { ActionButton } from '@/components/molecules';

@Component({
  components: {
    abutton: ActionButton,
  },
})
export default class LineShare extends Vue {
  get shareLink() {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://dj7.io')}`;
  }

  public open() {
    window.open(this.shareLink);
  }
}
</script>
