<template>
  <div
    class="player-config"
    @click="isListActive = !isListActive"
    @mouseleave="hideList"
  >
    <p>x{{ playingSpeed }}</p>
    <transition name="fade">
      <ul class="speed-list" v-if="isListActive">
        <li @click="playingSpeed = 0.25">0.25</li>
        <li @click="playingSpeed = 0.5">0.5</li>
        <li @click="playingSpeed = 0.75">0.75</li>
        <li @click="playingSpeed = 1">1</li>
        <li @click="playingSpeed = 1.25">1.25</li>
        <li @click="playingSpeed = 1.5">1.5</li>
        <li @click="playingSpeed = 1.75">1.75</li>
        <li @click="playingSpeed = 2">2</li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { sleep } from '../../utils';

@Component
export default class PlayerConfig extends Vue {
  @Prop({ default: 1 })
  public value!: number;

  get playingSpeed() {
    return this.value;
  }

  set playingSpeed(s: number) {
    this.$emit('input', s);
  }

  public isListActive = false;

  public async hideList() {
    await sleep(200);

    if (!this.$el.matches(':hover')) {
      this.isListActive = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.player-config {
  position: relative;
  cursor: pointer;
  height: 100%;
  width: 75px;
  text-align: center;
  transition: background 0.2s;

  &:hover {
    background: var(--controller-info-hover);
  }

  p {
    transition: color 0.2s;

    &:hover {
      color: var(--button-active);
    }
  }
}

.speed-list {
  position: absolute;
  list-style-type: none;
  padding: 0;
  bottom: 90%;
  width: 75px;

  padding: 10px 0;
  background-color: var(--volume-picker-bg);
  border: solid 1px var(--volume-picker-border);
  z-index: 100;

  li {
    padding: 10px 0;
    transition: background 0.2s;

    &:hover {
      background: var(--controller-info-hover);
    }
  }

  &:before {
    content: "";
    position: absolute;
    top: 100%;
    right: 50%;
    transform: translateX(50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 10px 0 10px;
    border-color: var(--volume-picker-bg) transparent transparent transparent;
    filter: drop-shadow(-1px 0px 0px var(--volume-picker-shadow));
  }
}
</style>
