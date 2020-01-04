<template>
  <div class="hub">
    <input type="text" v-model="jumpTo" />
    <button @click="jump">Jump</button>
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
      <router-link :to="`/${this.roomId}`" v-if="isRequestOnly">
        Go player mode
      </router-link>
      <!-- <router-link :to="`/${this.roomId}/req`" v-else>
        Go requrest only mode
      </router-link> -->
      <router-link to="/about">Realtime Tester</router-link>
    </p>

    <div class="player-container" v-if="!isRequestOnly">
      <p
        style="color: #fff; background: #333; width: 300px; padding: 10px;"
        v-if="!player"
      >
        No videos in the queue
      </p>
    </div>

    <input-area @parsed="addQueue"></input-area>

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
import InputArea from '@/components/InputArea.vue';
import Room, { Music } from '@/models/room';
import PlayerStatus from '../models/playerStatus';

const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Component({
  components: {
    YoutubePlayer,
    InputArea,
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

  public registerEvents() {
    window.addEventListener('beforeunload', this.destructor);
  }

  public unregisterEvents() {
    window.removeEventListener('beforeunload', this.destructor);
  }

  private previousPlayedTime?: number;

  public addRoom() {
    this.roomRef.set({
      player: {
        music: null,
        playedTime: 0,
        status: PlayerStatus.NO_MUSIC,
        updatedAt: Date.now(),
      },
      queues: [],
      roomId: this.roomId,
      users: [],
    });
  }

  public async init() {
    this.roomId = this.$route.params.roomId;
    this.registerEvents();

    const snapshot = await this.roomRef.get();
    let roomStatus = snapshot.data() as Room;

    if (!snapshot.exists) {
      this.addRoom();
      roomStatus = (await this.roomRef.get()).data() as Room;
    }

    await this.updateRoomStatus(roomStatus);

    this.roomRef.update({
      users: arrayUnion(this.currentUser.uid),
    });

    this.unsubscribeLister = this.roomRef.onSnapshot(async (doc) => {
      await this.updateRoomStatus(doc.data() as Room);

      const { updatedAt, playedTime, status } = this.roomStatus!.player;

      if (this.previousPlayedTime === playedTime) {
        return;
      }

      this.previousPlayedTime = playedTime;
      const seekTo = status === PlayerStatus.PLAY
        ? ((Date.now() - updatedAt) / 1000) + playedTime : playedTime;

      // console.log(seekTo, this.player);

      this.player?.setStatus(status, seekTo);
    });
  }

  private player: YoutubePlayer | null = null;

  public async updateRoomStatus(roomStatus: Room) {
    const previousId = this.roomStatus?.player.music?.id;
    this.roomStatus = roomStatus;

    const {
      music, updatedAt, playedTime, status,
    } = roomStatus.player;

    if (status === PlayerStatus.NO_MUSIC) {
      this.player?.$destroy();
      this.$el.querySelector('.player')?.remove();
      this.player = null;
      this.musicSource = '';
      return;
    }

    const { source, platform, id } = music;

    if (id && id !== previousId) {
      this.musicSource = source;

      this.player?.$destroy();
      this.$el.querySelector('.player')?.remove();

      const container = this.$el.querySelector('.player-container') as HTMLElement;
      container?.insertAdjacentHTML('afterbegin', '<div class="player-is-here"></div>');

      this.player = new YoutubePlayer({
        el: '.player-is-here',
        propsData: {
          roomId: this.roomId,
          source,
        },
      });
      this.player.$on('update', this.onStatusChanged);
      this.player.$on('end', this.onMusicEnded);

      // console.log(this.player);
      await this.player.init();
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

  public addQueue(items: Music[]) {
    if (this.roomStatus?.player.status === PlayerStatus.NO_MUSIC) {
      this.roomRef.update({
        'player.status': PlayerStatus.PLAY,
        'player.music': items[0],
        'player.updatedAt': Date.now(),
      });

      if (items.length === 1) {
        return;
      }

      items.unshift();
    }

    this.roomRef.update({
      queues: arrayUnion(...items),
    });
  }

  private onStatusChanged(status: number, playedTime: number) {
    if (status === this.roomStatus?.player.status) {
      return;
    }

    this.roomRef.update({
      'player.status': status,
      'player.playedTime': playedTime,
      'player.updatedAt': Date.now(),
    });
  }

  private onMusicEnded() {
    const { music } = this.roomStatus!.player;
    const { queues } = this.roomStatus!;

    if (queues.length === 0) {
      this.roomRef.update({
        player: {
          music: null,
          playedTime: 0,
          status: PlayerStatus.NO_MUSIC,
          updatedAt: Date.now(),
        },
      });

      return;
    }

    const nextMusic = queues[0];
    queues.shift();

    this.roomRef.update({
      player: {
        music: nextMusic,
        playedTime: 0,
        status: PlayerStatus.PLAY,
        updatedAt: Date.now(),
      },
      queues,
    });
  }

  public jumpTo = '';

  public jump() {
    if (!this.jumpTo) {
      return;
    }

    const { origin } = window.location;
    window.location.href = `${origin}/${this.jumpTo}`;
  }
}
</script>

<style lang="scss" scoped>
</style>
