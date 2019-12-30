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
</style>
