<template>
  <button
    :class="`action-button ${isPhone ? '' : 'has-effect'}`"
    :title="title"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';
import isMobile from 'ismobilejs';

@Component
export default class ActionButton extends Vue {
  @Prop({ default: '' })
  public title!: string;

  get isPhone() {
    return isMobile().phone;
  }
}
</script>

<style lang="scss" scoped>
.action-button {
  min-width: 70px;
  padding: 0 10px;
  height: 25px;
  border-radius: 9999px;
  color: var(--button-fc);
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  font-size: 0.9em;
  user-select: none;

  &.is-large {
    width: 130px;
    height: 30px;
    font-size: 1em;
  }
}

.action-button.has-effect {
  position: relative;
  cursor: pointer;

  &:not(:disabled) {
    &:hover {
      border-color: var(--button-hover);
      color: var(--button-hover);
    }

    &:after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      border-radius: 9999px;
      opacity: 0;
      background: var(--button-active);
      transition: all 0.8s;
    }

    &:active:after {
      // background: #f50;
      opacity: 0.8;
      transition: all 0s;
    }

    &:focus {
      outline: 0;
      box-shadow: 0px 0px 3px var(--button-focus);
      border-color: var(--button-focus);
    }
  }

  &:disabled {
    color: var(--button-fc-disabled);
    background: var(--button-bg-disabled);
    cursor: not-allowed;
  }
}

@media screen and (max-width: 480px) {
  .action-button {
    min-width: 50px;
  }
}

@keyframes button-flush {
  0%,
  100% {
    background: transparent;
  }

  50% {
    background: var(--button-active);
  }
}
</style>
