<template>
  <div class="action-button" :title="title" @click="$emit('click')">
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
  --button-width: 25px;
  --button-height: 25px;
  --border-color: #ccc;
  --border-color-hover: #777;

  cursor: pointer;
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  min-width: var(--button-width);
  height: var(--button-height);
  color: #333;
  border-top: solid 1px;
  border-bottom: solid 1px;
  text-align: center;
  line-height: 30px;
  font-size: 0.9em;
  margin: 0 35px;

  &:after,
  &:before {
    content: "";
    position: absolute;
    right: 100%;
    width: var(--button-width);
    height: var(--button-height);
    border-top: solid 1px;
    border-left: solid 1px;
    border-bottom: solid 1px;
    border-radius: 50% 0 0 50%;
  }

  &:after {
    left: 100%;
    transform: rotate(180deg);
  }

  &,
  &:after,
  &:before {
    border-color: var(--border-color);
    transition: all 0.1s;
  }

  &:hover,
  &:hover:after,
  &:hover:before {
    // border-color: var(--border-color-hover);
    border-color: var(--button-color);
    color: var(--button-color);
  }
}
</style>
