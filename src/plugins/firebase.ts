/* eslint-disable no-param-reassign */

import Vue, { VueConstructor, PluginObject } from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

declare module 'vue/types/vue' {
  interface Vue {
    $auth: firebase.auth.Auth;
    $firestore: firebase.firestore.Firestore;
  }

  interface VueConstructor {
    $auth: firebase.auth.Auth;
    $firestore: firebase.firestore.Firestore;
  }
}

const firebaseConfig = {
  apiKey: 'AIzaSyDNymPlrtN1h5LM7DSg7YLyEw2CEQa8gNY',
  authDomain: 'sairilab-musichub.firebaseapp.com',
  databaseURL: 'https://sairilab-musichub.firebaseio.com',
  projectId: 'sairilab-musichub',
  storageBucket: 'sairilab-musichub.appspot.com',
  messagingSenderId: '1040913343225',
  appId: '1:1040913343225:web:55642f366ef729023a7828',
  measurementId: 'G-78Z8YSTCVZ',
};

export const app = firebase.initializeApp(firebaseConfig);

export default {
  install(vue: VueConstructor, options: any) {
    vue.prototype.$firestore = app.firestore();
    vue.prototype.$auth = app.auth();
  },
} as PluginObject<Vue>;
