<template>
  <div class="documents">
    <p>DJ7にお越しいただき、ありがとうございます。</p>
    <p>
      <a href="https://note.com/imataka7/n/n3972fdc2947a">
        使い方についてはこちらをご参照ください(noteが開きます)
      </a>
    </p>
    <p>ご使用されている際に気づいた点、要望などは以下までお願いいたします。</p>
    <p><a href="https://marshmallow-qa.com/imataka7">マシュマロ(質問箱)</a></p>
    <p><a href="https://twitter.com/imataka7">開発者Twitter(@imataka7)</a></p>
    <p><a href="https://twitter.com/dj7app">DJ7 Twitter(@dj7app)</a></p>
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
