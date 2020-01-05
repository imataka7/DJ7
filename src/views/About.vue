<template>
  <div class="about">
    <h1>This is an about <router-link to="/">page</router-link></h1>
    <p>Send to firestore at {{ firestoreTime }} by {{ updater }}</p>
    <p>You received at {{ currentTime }}</p>
    <p>Diff: {{ currentTime - firestoreTime }} msec</p>
    <button @click="push">push</button>

    <input type="text" v-model="text" />
    <button @click="search">search</button>
    {{ id }}
    <p></p>
    <div class="video-player"></div>
    <pre>{{ list }}</pre>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import YouTube from 'youtube-player';
import { YouTubePlayer } from 'youtube-player/dist/types';
import sleep from '../utils/sleep';
import searchVideo from '@/utils/search';

@Component
export default class About extends Vue {
  get ref() {
    return this.$firestore.collection('test').doc('test');
  }

  public firestoreTime: number = 0;

  public currentTime: number = 0;

  public updater = '';

  public unsubscribe: any;

  public async created() {
    const snapshot = await this.ref.get();
    const data = snapshot.data()!;

    this.unsubscribe = this.ref.onSnapshot((doc) => {
      this.firestoreTime = doc.data()?.test;
      this.currentTime = Date.now();
      this.updater = doc.data()?.pushedBy;
    });

    this.currentTime = 0;
  }

  public beforeDestroy() {
    this.unsubscribe();
  }

  public push() {
    this.ref.update({
      test: Date.now(),
      pushedBy: this.$auth.currentUser?.displayName,
    });
  }

  public text = '白日';

  public player!: YouTubePlayer;

  public mounted() {
    const el = this.$el.querySelector('.video-player');
    this.player = YouTube(el as HTMLElement);
  }

  public list: readonly string[] | undefined | null= [];

  public async waitUntilPlaylistLoaded() {
    this.list = null;

    await new Promise((resolve) => {
      const listener = this.player.on('stateChange', async (event) => {
        this.list = await this.player.getPlaylist();

        if (this.list !== null) {
          // Somehow `off` doesn't exist in the type definition.
          // @ts-ignore
          this.player.off(listener);
          resolve();
        }
      });
    });
    // this.player.removeEventListener('stateChange', )
  }

  public id = '';

  public async search() {
    const start = performance.now();

    const id = await searchVideo(this.text);
    if (!id) {
      // console.log('not found');
      return;
    }

    this.player.loadVideoById(id);

    this.id = id;

    // console.log(performance.now() - start);
  }
}
</script>
