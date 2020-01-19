<template>
  <button class="button action-button" :title="title" @click="$emit('click')">
    <slot></slot>
  </button>
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
  width: 70px;
  height: 25px;
  border-radius: 9999px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-size: 0.9em;
}

@media screen and (max-width: 480px) {
  .action-button {
    width: 50px;
  }
}

// .action-button {
//   --button-color: rgba(255, 85, 0, 1);
//   --button-width: 70px;
//   --button-height: 25px;
//   --border-color: #ccc;
//   --border-color-hover: #777;

//   cursor: pointer;
//   position: relative;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   min-width: var(--button-width);
//   height: var(--button-height);
//   border: solid 1px;
//   border-radius: 9999px;
//   font-size: 0.9em;
//   border-color: var(--border-color);
//   transition: all 0.1s;
//   padding: 0;
//   color: #333;
//   background: #fff;

//   &:not(:disabled) {
//     &:hover {
//       border-color: var(--button-color);
//       color: var(--button-color);
//     }

//     &:after {
//       content: "";
//       position: absolute;
//       width: 100%;
//       height: 100%;
//       border-radius: 9999px;
//       opacity: 0;
//       background: #f50;
//       transition: all 0.8s;
//     }

//     &:active:after {
//       // background: #f50;
//       opacity: 0.8;
//       transition: 0s;
//     }

//     &:focus {
//       outline: 0;
//       box-shadow: 0px 0px 3px var(--button-color);
//       border-color: var(--button-color);
//     }
//   }

//   &:disabled {
//     color: #ddd;
//     cursor: not-allowed;
//   }
// }

// @media screen and (max-width: 480px) {
//   .action-button {
//     min-width: 0;
//     width: 50px;

//     &:not(:disabled):hover {
//       &:hover {
//         color: initial;
//         border-color: var(--border-color);
//       }

//       &:after {
//         transition: all 0.5s;
//       }
//     }
//   }
// }

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
