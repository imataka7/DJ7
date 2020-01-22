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
  Component, Vue, Prop, Watch,
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
  width: 70px;
  height: 25px;
  border-radius: 9999px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 0.9em;
  user-select: none;
}

.action-button.has-effect {
  --button-color: rgba(255, 85, 0, 1);
  --border-color: #ccc;
  --border-color-hover: #777;

  position: relative;
  cursor: pointer;

  &:not(:disabled) {
    &:hover {
      border-color: var(--button-color);
      color: var(--button-color);
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
      background: #f50;
      transition: all 0.8s;
    }

    &:active:after {
      // background: #f50;
      opacity: 0.8;
      transition: all 0s;
    }

    &:focus {
      outline: 0;
      box-shadow: 0px 0px 3px var(--button-color);
      border-color: var(--button-color);
    }
  }

  &:disabled {
    color: #ddd;
    cursor: not-allowed;
  }
}

@media screen and (max-width: 480px) {
  .action-button {
    width: 50px;
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
