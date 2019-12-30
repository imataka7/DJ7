<template>
  <div class="signin">
    <h1>Welcome!</h1>
    <div class="firebaseui-auth-container"></div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

const uiConfig = {
  signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  tosUrl: '/term-of-service',
  privacyPolicyUrl: '/privacy-policy',
} as firebaseui.auth.Config;

@Component
export default class Signin extends Vue {
  private get ui() {
    return new firebaseui.auth.AuthUI(this.$auth);
  }

  public mounted() {
    this.ui.start('.firebaseui-auth-container', uiConfig);
  }
}
</script>

<style lang="scss" scoped>
.signin {
  text-align: center;
}
</style>
