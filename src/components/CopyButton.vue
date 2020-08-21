<template>
  <abutton @click="copy"><fa-icon icon="clone"></fa-icon> {{ text }}</abutton>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue } from 'vue-property-decorator';
import { ActionButton } from '@/components/molecules';

const textCopy = 'リンクをコピー';
const textCopied = 'コピーしました！';

@Component({
  components: {
    abutton: ActionButton,
  },
})
export default class CopyButton extends Vue {
  public text = textCopy;

  get url() {
    const { origin, pathname } = window.location;
    return `${origin}${decodeURIComponent(pathname)}`;
  }

  public async copy() {
    await navigator.clipboard.writeText(this.url);

    this.text = textCopied;
    setTimeout(() => { this.text = textCopy; }, 1500);
  }
}
</script>
