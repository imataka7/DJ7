<template>
  <div class="hub">
    <h1>
      MusicHub RoomId: {{ roomId }}
      <br />
      Welcome {{ currentUser.displayName }}
      {{ isHost ? "You are the host" : "" }}
    </h1>
    <img
      style="width: 75px; height: 75px;"
      :src="currentUser.photoURL"
      alt="icon"
    />
    <button @click="$auth.signOut()">Sign out</button>

    <p>
      <a href="https://www.youtube.com/embed/oOv98YTPkUs">
        debug you no url dao
      </a>
      <br />
      <router-link :to="`/${this.roomId}`" v-if="isRequestOnly"
        >Go player mode</router-link
      >
      <router-link :to="`/${this.roomId}/req`" v-else>
        Go requrest only mode
      </router-link>
      <router-link to="/about">Realtime Tester</router-link>
    </p>

    <div class="input-area">
      <input type="url" v-model="musicSourceInner" />
      <button @click="addQueue">Queue</button>
    </div>

    <div class="player-container" v-if="!isRequestOnly">
      <!-- <youtube-player
        :video-url="musicSource"
        :room-id="roomId"
        v-if="musicSource !== ''"
        @update="onStatusChanged"
        :key="roomId"
      ></youtube-player> -->
      <p
        style="color: #fff; background: #333; width: 300px; padding: 10px;"
        v-if="musicSource === ''"
      >
        No videos are selected
      </p>
    </div>

    <pre>{{ roomStatus }}</pre>
    <pre>{{ JSON.stringify(currentUser, null, "  ") }}</pre>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { getEmbedUrl, getMusicInfo } from '@/utils/urlParser';
import YoutubePlayer from '@/components/YoutubePlayer.vue';
import Room from '@/models/room';
import controllers from '@/store/modules/controllers';
import PlayerStatus from '../models/playerStatus';

const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Component({
  components: {
    YoutubePlayer,
  },
})
export default class Hub extends Vue {
  get currentUser() {
    return this.$auth.currentUser!;
  }

  public roomId = '';

  get isRequestOnly() {
    return !!this.$route.path.match(/\/req$/);
  }

  get roomRef() {
    return this.$firestore.collection('rooms').doc(this.roomId);
  }

  get isHost() {
    return this.currentUser.uid === this.roomStatus?.users[0];
  }

  public roomStatus: Room | null = null;

  public unsubscribeLister?: () => void;

  get controller() {
    return controllers.getControllerById(this.roomId);
  }

  public registerEvents() {
    window.addEventListener('beforeunload', this.destructor);
  }

  public unregisterEvents() {
    window.removeEventListener('beforeunload', this.destructor);
  }

  public async init() {
    this.roomId = this.$route.params.roomId;
    this.registerEvents();

    this.roomRef.update({
      users: arrayUnion(this.currentUser.uid),
    });

    // const snapshot = await this.roomRef.get();
    // const data = snapshot.data();
    // const status = data as Room;

    // this.updateRoomStatus(status);

    this.unsubscribeLister = this.roomRef.onSnapshot(async (doc) => {
      this.updateRoomStatus(doc.data() as Room);

      const { updatedAt, playedTime } = this.roomStatus!.player;
      const seekTo = ((Date.now() - updatedAt) / 1000) + playedTime;

      // console.log(seekTo, this.controller);

      await this.controller?.setStatus(this.roomStatus!.player.status, seekTo);
    });
  }

  public async updateRoomStatus(status: Room) {
    this.roomStatus = status;

    const { source, updatedAt, playedTime } = status.player;
    if (source && source !== this.musicSource) {
      const player = new YoutubePlayer({
        el: '.player-container',
        propsData: {
          roomId: this.roomId,
          videoUrl: source,
        },
      }).$mount();
      player.$on('update', this.onStatusChanged);

      this.musicSource = source;
      // console.log(this.controller);
    }
  }

  public async mounted() {
    await this.init();
  }

  public unsubscribeUser() {
    this.roomRef.update({
      users: arrayRemove(this.currentUser.uid),
    });
  }

  private destructor() {
    this.unsubscribeUser();
    this.unsubscribeLister?.();
  }

  public beforeDestroy() {
    this.unregisterEvents();
    this.destructor();
  }

  public musicSource: string = '';

  public musicSourceInner: string = 'https://www.youtube.com/embed/oOv98YTPkUs';

  public addQueue() {
    const info = getMusicInfo(this.musicSourceInner);

    // TODO: show error
    if (!info) {
      return;
    }

    this.musicSource = info.source;
    this.roomRef.update({
      queues: arrayUnion(info),
    });
  }

  public onStatusChanged(status: number, playedTime: number) {
    if (status === this.roomStatus?.player.status) {
      return;
    }

    this.roomRef.update({
      'player.status': status,
      'player.playedTime': playedTime,
      'player.updatedAt': Date.now(),
    });
  }
}
</script>

<style lang="scss" scoped>
</style>
