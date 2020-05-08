import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Swiper from 'swiper';
import isMobile from 'ismobilejs';
import PlayerStates from 'youtube-player/dist/constants/PlayerStates';

import {
  YoutubePlayer,
  InputArea,
  MusicQueue,
  HistoryList,
  PlayerController,
  ShareButton,
  AdSquare
} from '@/components';
import { Room, RoomUser, Musicx, Music, User, PlayerStatus } from '@/models';
import {
  sleep,
  setEvent,
  getEmbedUrl,
  getMusicInfo,
  getClone,
  showToast
} from '@/utils';
import { user, room, adate } from '@/store/modules';
import { ActionButton } from '@/components/molecules';
import { logger } from '@/plugins/logger';

const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Component({
  components: {
    YoutubePlayer,
    InputArea,
    MusicQueue,
    HistoryList,
    PlayerController,
    ShareButton,
    abutton: ActionButton,
    AdSquare
  }
})
export default class Hub extends Vue {
  get dbg() {
    return process.env.NODE_ENV === 'development'
  }

  // RoleTagから論理話をとってDJ操作の可不可を算出
  // (Government, Array<RoleTag>) -> Boolean
  get role() {
    return {
      isDj: this.isDj,
      isAdmin: this.isAdmin,
    }
  }

  get isDj() {
    if (this.government === 'monarchism') {
      const uid = this.currentUser?.uid || '';
      const myRole = this.adminUsers
        .filter((adminUser) => adminUser.uid === uid).shift();
      return !!(myRole?.roleTags.includes('managePlay'))
    } else {
      return true
    }
  }

  get isAdmin() {
    if (this.government === 'monarchism') {
      const uid = this.currentUser?.uid || '';
      const myRole = this.adminUsers
        .filter((adminUser) => adminUser.uid === uid).shift();
      return !!(myRole?.roleTags.includes('manageUser'))
    } else {
      return true
    }
  }

  get government() {
    if (room.government === 'monarchism') {
      return 'monarchism'
    } else {
      return 'anarchism'
    }
  }

  get adminUsers() {
    return room.adminUsers
  }

  get version() {
    return `v${process.env.VUE_APP_VERSION.replace('+', ' on ')}`;
  }

  get currentUser() {
    return user.user;
  }

  get users() {
    const users = room?.users || [];
    return getClone(users).reverse();
  }

  get roomId() {
    return this.$route.params.roomId || 'general';
  }

  public async init() {
    await room.init(this.roomId);
  }

  get roomStatus() {
    return room.status;
  }

  public swiper?: Swiper;

  public initSwiper() {
    this.swiper = new Swiper('.swiper-container', {
      direction: 'horizontal',
      loop: false,
      slidesPerView: 1,
      breakpoints: {
        1240: {
          slidesPerView: 3,
          allowTouchMove: false
        }
      }
    });
  }

  public updateSwiper() {
    if (window.innerWidth < 1240 && !this.swiper) {
      this.initSwiper();
      return;
    }

    this.swiper?.update();
  }

  public async mounted() {
    if (window.innerWidth < 1240) {
      this.initSwiper();
    }

    setEvent(window, 'resize', this.updateSwiper);

    await Promise.all([this.init()]);
  }
}
