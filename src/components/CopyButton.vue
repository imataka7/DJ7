<template>
  <abutton @click="copy">{{ text }}</abutton>
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

  public async copy() {
    await navigator.clipboard.writeText(window.location.href);

    this.text = textCopied;
    setTimeout(() => { this.text = textCopy; }, 1000);
  }
}
</script>
