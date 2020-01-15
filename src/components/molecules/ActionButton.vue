<template>
  <div class="button action-button" :title="title" @click="$emit('click')">
    <slot></slot>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';

@Component
export default class ActionButton extends Vue {
  @Prop({ default: '' })
  public title!: string;
}
</script>

<style lang="scss" scoped>
.action-button {
  --button-color: rgba(255, 85, 0, 1);
  --button-width: 70px;
  --button-height: 25px;
  --border-color: #ccc;
  --border-color-hover: #777;

  cursor: pointer;
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: var(--button-width);
  height: var(--button-height);
  color: #333;
  border: solid 1px;
  border-radius: 9999px;
  text-align: center;
  line-height: 30px;
  font-size: 0.9em;
  border-color: var(--border-color);
  transition: all 0.1s;

  &:hover {
    border-color: var(--button-color);
    color: var(--button-color);
  }

  &:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    opacity: 0;
    background: #f50;
    transition: all 0.8s;
  }

  &:active:after {
    // background: #f50;
    opacity: 0.8;
    transition: 0s;
  }
}

@keyframes button-flush {
  0%,
  100% {
    background: transparent;
  }

  50% {
    background: #f50;
  }
}
</style>
