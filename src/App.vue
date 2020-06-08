<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue } from 'vue-property-decorator';
import isMobile from 'ismobilejs';
import setEvent from '@/utils/eventUtil';
import { adate, user } from '@/store/modules';

@Component
export default class MusicHub extends Vue {
  public setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  public emitAccessEvent() {
    const pwa = window.matchMedia('(display-mode: standalone)').matches;

    if (pwa) {
      const mobile = isMobile().phone || isMobile().tablet;
      this.$ga.logEvent('PWA', {
        device: mobile ? 'mobile' : 'PC',
      });
    }
  }

  public async created() {
    this.emitAccessEvent();

    if (!/Mac OS/.test(navigator.userAgent)) {
      const root = document.querySelector(':root') as HTMLElement;
      root.dataset.scrollbar = 'custom';
    }

    this.$auth.onAuthStateChanged(firebaseUser => firebaseUser && user.init(firebaseUser));

    await adate.init();
    this.$set(window, 'getAdjustedDate', () => `${adate.now()} ${adate.diff}`);
  }

  public mounted() {
    this.setVh();

    setEvent(window, 'resize', this.setVh);
    setEvent(window, 'orientatoinchange', this.setVh);
  }
}
</script>

<style lang="scss">
@import "~normalize.css";
@import "~@sweetalert2/theme-dark/dark.scss";
@import url("https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap");
@import "./styles/sairi-components.scss";
@import "./styles/animations.scss";

$black: #000;
$gray-1: #111;
$gray-2: #222;
$gray-3: #333;
$gray-4: #444;
$gray-5: #555;
$gray-6: #666;
$gray-7: #777;
$gray-8: #888;
$gray-9: #999;
$gray-10: #aaa;
$gray-11: #bbb;
$gray-12: #ccc;
$gray-13: #ddd;
$gray-14: #eee;
$white: #fff;

$sairi-orange: #f50;

@mixin is-light-mode {
  --bgc: #{$white};
  --fc: #{$black};

  --scrollbar-thumb: #{$gray-7};
  --scrollbar-track: #{$white};
  --scrollbar-track-shadow: #{$gray-7};

  --hub-header-border: #{$gray-13};
  --hub-no-music-bg: #{$gray-3};
  --hub-no-music-fc: #{$white};

  --list-item-bg-hover: #{$gray-14};
  --list-item-link-fc-hover: #{$sairi-orange};

  --button-bg: #{$white};
  --button-fc: #{$black};
  --button-border: #{$gray-7};
  --button-hover: #{$sairi-orange};
  --button-active: #{$sairi-orange};
  --button-focus: #{$sairi-orange};
  --button-fc-disabled: #{$gray-13};
  --button-bg-disabled: #{$gray-6};

  --input-bg: #{$white};
  --input-fc: #{$black};
  --input-placeholder-fc: #{$gray-5};
  --input-border: #a9a9a9;

  --controller-bg: #{$gray-14};
  --controller-border: #{$gray-11};
  --controller-button-fc: #{$black};
  --controller-button-hover: #{$sairi-orange};
  --controller-button-disabled: #{$gray-5};
  --controller-info-hover: #{$gray-13};
  --controller-clickme-bg: #{$gray-3};
  --controller-clickme-fc: #{$white};
  --controller-swipe-handler: #{$gray-10};

  --volume-picker-bg: #{$gray-14};
  --volume-picker-border: #{$gray-11};
  --volume-picker-shadow: #{$gray-10};
}

@mixin is-dark-mode {
  --bgc: #{$gray-2};
  --fc: #{$gray-14};

  --scrollbar-thumb: #{$gray-8};
  --scrollbar-track: #{$black};
  --scrollbar-track-shadow: #{$gray-8};

  --hub-header-border: #{$gray-5};
  --hub-no-music-bg: #{$gray-12};
  --hub-no-music-fc: #{$black};

  --list-item-bg-hover: #{$gray-5};
  --list-item-link-fc-hover: #{$sairi-orange};

  --button-bg: #{$gray-2};
  --button-fc: #{$gray-14};
  --button-border: #{$gray-8};
  --button-hover: #{$sairi-orange};
  --button-active: #{$sairi-orange};
  --button-focus: #{$sairi-orange};
  --button-fc-disabled: #{$gray-6};
  --button-bg-disabled: #{$gray-4};

  --input-bg: #{$gray-2};
  --input-fc: #{$gray-14};
  --input-placeholder-fc: #{$gray-9};
  --input-border: #{$gray-5};

  --controller-bg: #{$gray-1};
  --controller-border: #{$gray-4};
  --controller-button-fc: #{$gray-14};
  --controller-button-hover: #{$sairi-orange};
  --controller-button-disabled: #{$gray-10};
  --controller-info-hover: #{$gray-2};
  --controller-clickme-bg: #{$gray-12};
  --controller-clickme-fc: #{$gray-2};
  --controller-swipe-handler: #{$gray-5};

  --volume-picker-bg: #{$gray-1};
  --volume-picker-border: #{$gray-4};
  --volume-picker-shadow: #{$gray-5};

  .dj7-logo > img {
    filter: invert(1);
  }
}

@media (prefers-color-scheme: light) {
  :root {
    @include is-light-mode;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    @include is-dark-mode;
  }
}

html {
  overflow: hidden auto;
  font-family: "Roboto Mono", "Meiryo UI", monospace;
  background: var(--bgc);
  color: var(--fc);
}

html,
body,
#app {
  height: 100%;
  // height: 100vh;
  // height: calc(var(--vh, 1vh) * 100);
  width: 100vw;
}

:root[data-scrollbar="custom"] {
  ::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }

  ::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border: none;
    border-radius: 10px;
    box-shadow: inset 0 0 2px var(--scrollbar-track-shadow);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 10px;
    box-shadow: none;
  }
}

:root {
  input[type="text"] {
    border-radius: 3px;
    background: var(--input-bg);
    color: var(--input-fc);
    border: 1px solid;
    border-color: var(--input-border);
    padding: 3px;

    &::placeholder {
      color: var(--input-placeholder-fc);
    }

    &:disabled {
      cursor: not-allowed;
      background: var(--button-bg-disabled);

      &::placeholder {
        color: var(--button-fc-disabled);
      }
    }
  }

  a:visited {
    color: var(--fc);
  }
}

@media screen and (max-width: 1200px) {
  // * {
  //   touch-action: pan-x pan-y;
  //   // touch-action: pan-y;
  // }

  html,
  body,
  #app {
    overflow: auto;
  }
}
</style>
