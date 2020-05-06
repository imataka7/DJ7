/* eslint-disable no-param-reassign */

import Vue, { VueConstructor, PluginObject } from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';

declare module 'vue/types/vue' {
  interface Vue {
    $auth: firebase.auth.Auth;
    $firestore: firebase.firestore.Firestore;
    $ga: firebase.analytics.Analytics;
  }

  interface VueConstructor {
    $auth: firebase.auth.Auth;
    $firestore: firebase.firestore.Firestore;
    $ga: firebase.analytics.Analytics;
  }
}

const firebaseConfig = {
  apiKey: process.env.VUE_APP_apiKey,
  authDomain: process.env.VUE_APP_authDomain,
  databaseURL: process.env.VUE_APP_databaseURL,
  projectId: process.env.VUE_APP_projectId,
  storageBucket: process.env.VUE_APP_storageBucket,
  messagingSenderId: process.env.VUE_APP_messagingSenderId,
  appId: process.env.VUE_APP_appId,
  measurementId: process.env.VUE_APP_measurementId,
};

export const app = firebase.initializeApp(firebaseConfig);
const anal = firebase.analytics();

export default {
  install(vue: VueConstructor, options: any) {
    vue.prototype.$firestore = app.firestore();
    vue.prototype.$auth = app.auth();
    vue.prototype.$ga = app.analytics();
  },
} as PluginObject<Vue>;
