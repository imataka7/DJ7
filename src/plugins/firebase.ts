/* eslint-disable no-param-reassign */

import Vue, { VueConstructor, PluginObject } from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';
import 'firebase/database';
import 'firebase/functions';

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
firebase.analytics();

export const rtdb = app.database();
export const firestore = app.firestore();
export const functions = app.functions();

export default {
  install(vue: VueConstructor) {
    vue.prototype.$firestore = firestore;
    vue.prototype.$auth = app.auth();
    vue.prototype.$ga = app.analytics();
  },
} as PluginObject<Vue>;
