<template>
  <div class="signin">
    <h1>DJ7へようこそ！</h1>
    <h2>{{ version }}</h2>
    <div class="firebaseui-auth-container"></div>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue,
} from 'vue-property-decorator';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { getVersion } from '@/utils';

const configureUi = (to?: string) => ({
  signInSuccessUrl: to || '/',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  tosUrl: '/terms-of-service',
  privacyPolicyUrl: '/privacy-policy',
} as firebaseui.auth.Config);

@Component
export default class Signin extends Vue {
  get version() {
    return getVersion();
  }

  private get ui() {
    return new firebaseui.auth.AuthUI(this.$auth);
  }

  public mounted() {
    const to = this.$route.query.redirect as string;
    this.ui.start('.firebaseui-auth-container', configureUi(to));
  }
}
</script>

<style lang="scss" scoped>
.signin {
  width: 100%;
  height: 100%;
  padding-top: 50px;

  text-align: center;
}
</style>
