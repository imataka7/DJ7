<template>
  <div class="tab-bar">
    <div
      class="tab-bar-button"
      @click="select('home')"
      :data-active="currentView === 'home'"
    >
      <span class="icon"><fa-icon icon="home"></fa-icon></span>
      <span class="button-desc">ルーム</span>
    </div>
    <!-- <div
      class="tab-bar-button"
      @click="select('add')"
      :data-active="currentView === 'add'"
    >
      <span class="icon"><fa-icon icon="plus-circle"></fa-icon></span>
      <span class="button-desc">追加</span>
    </div> -->
    <div
      class="tab-bar-button"
      @click="select('queue')"
      :data-active="currentView === 'queue'"
    >
      <span class="icon"><fa-icon icon="list"></fa-icon></span>
      <span class="button-desc">キュー</span>
    </div>
    <div
      class="tab-bar-button"
      @click="select('history')"
      :data-active="currentView === 'history'"
    >
      <span class="icon"><fa-icon icon="history"></fa-icon></span>
      <span class="button-desc">履歴</span>
    </div>
    <div
      class="tab-bar-button"
      @click="select('player')"
      :data-active="currentView === 'player'"
    >
      <span class="icon"><fa-icon icon="music"></fa-icon></span>
      <span class="button-desc">プレイヤー</span>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class TabBar extends Vue {
  @Prop({ default: 'home' })
  public currentView!: string;

  public select(name: string) {
    this.$emit('update:currentView', name);
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;

  cursor: pointer;
  height: 50px;
  width: 100%;
  background-color: var(--controller-bg);
  border-top: solid 1px var(--controller-border);
}

.tab-bar-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // width: 50px;
  width: calc(100% / 4);

  .icon {
    font-size: 1.5em;
  }

  .button-desc {
    font-size: 0.5em;
  }

  &[data-active] {
    color: var(--button-active);
  }
}
</style>
