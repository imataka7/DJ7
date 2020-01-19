<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';

@Component
export default class MusicHub extends Vue {
}
</script>

<style lang="scss">
@import "~normalize.css";
@import url("https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap");

html {
  overflow: hidden auto;
}

html,
body,
#app {
  height: 100%;
}

:root {
  ::-webkit-scrollbar {
    width: 7px;
  }

  ::-webkit-scrollbar-track {
    background: #fff;
    border: none;
    border-radius: 10px;
    box-shadow: inset 0 0 2px #777;
  }

  ::-webkit-scrollbar-thumb {
    background: #777;
    border-radius: 10px;
    box-shadow: none;
  }
}

@media screen and (max-width: 480px) {
  * {
    touch-action: pan-x pan-y;
    // touch-action: pan-y;
  }
}
</style>
