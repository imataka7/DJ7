<template>
  <div class="hub">
    <h1>
      MusicHub
      RoomId: {{ $route.params.roomId }}
      <br />
      Welcome {{ currentUser.displayName }}
    </h1>
    <img style="width: 75px; height: 75px;" :src="currentUser.photoURL" alt="icon" />
    <button @click="$auth.signOut()">Sign out</button>

    <p>
      <a href="https://www.youtube.com/embed/oOv98YTPkUs">url</a>
    </p>

    <div class="input-area">
      <input type="url" v-model="videoUrlInner" />
      <button @click="setUrl">Queue</button>
    </div>

    <div class="player-container">
      <youtube-player :video-url="videoUrl" v-if="videoUrl !== ''" @update="play"></youtube-player>
      <p
        style="color: #fff; background: #333; width: 300px; padding: 10px;"
        v-else
      >No videos are selected</p>
    </div>

    <pre>{{ JSON.stringify( currentUser, null, '  ' ) }}</pre>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import { getEmbedUrl } from '@/utils/urlParser';
import YoutubePlayer from '@/components/YoutubePlayer.vue';

@Component({
  components: {
    YoutubePlayer,
  },
})
export default class Hub extends Vue {
  get currentUser() {
    return this.$auth.currentUser;
  }

  public videoUrl: string = '';

  public videoUrlInner: string = 'https://www.youtube.com/embed/oOv98YTPkUs';

  public setUrl() {
    this.videoUrl = getEmbedUrl(this.videoUrlInner);
  }

  public play() {
    console.log('pass');
  }

  public pause() {
    console.log('pass');
  }
}
</script>

<style lang="scss" scoped>
</style>
