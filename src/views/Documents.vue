<template>
  <div class="documents">
    <p>DJ7にお越しいただき、ありがとうございます。</p>
    <p>ご使用されている際に気づいた点、要望などは以下までお願いいたします。</p>
    <p><a href="https://twitter.com/imataka7">開発者Twitter(@imataka7)</a></p>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Documents extends Vue {}
</script>

<style lang="scss" scoped>
.documents {
  text-align: center;
}
</style>
