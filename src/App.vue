<template>
  <div id="app">
    <p style="position: absolute; top: 10px; left: 10px;">{{ height }}</p>
    <router-view />
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import setEvent from '@/utils/eventUtil';

@Component
export default class MusicHub extends Vue {
  public setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.height += vh * 100;
  }

  public height = 0;

  public mounted() {
    this.setVh();

    setEvent(window, 'resize', this.setVh);
    setEvent(window, 'orientatoinchange', this.setVh);

    // window.addEventListener('resize', () => {
    //   this.setVh();
    // });
  }
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
  // height: 100vh;
  // height: calc(var(--vh, 1vh) * 100);
  width: 100vw;
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

@media screen and (max-width: 1200px) {
  * {
    touch-action: pan-x pan-y;
    // touch-action: pan-y;
  }

  html,
  body,
  #app {
    overflow: auto;
  }
}
</style>
