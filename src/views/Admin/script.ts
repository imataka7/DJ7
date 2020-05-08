import { Component, Vue, Watch } from 'vue-property-decorator';
import 'firebase/firestore';
import Swiper from 'swiper';

import {
  YoutubePlayer,
  InputArea,
  MusicQueue,
  HistoryList,
  PlayerController,
  ShareButton,
  AdSquare
} from '@/components';
import { Room, Musicx, Music, PlayerStatus, Role } from '@/models';
import {
  setEvent,
  getClone,
  showToast
} from '@/utils';
import { user, room, adate } from '@/store/modules';
import { ActionButton } from '@/components/molecules';
import roleBook from '@/roleBook';

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
  sw = false;

  get dbg() {
    return process.env.NODE_ENV === 'development'
  }

  // RoleTagから論理話をとってDJ操作の可不可を算出
  // (Government, Array<RoleTag>) -> Boolean
  get role(): Role {
    if (!this.currentUser) {
      // currentUser is null
      return roleBook['dog']
    } else {
      const uid = this.currentUser.uid;
      const myRole = room.adminUsers
        .filter((adminUser) => adminUser.uid === uid).shift();
      const role: Role = room.isMonarchism ?
        // monarchism
        // roleBook["managePlay"] + roleBook["manageUser"]
        {
          playerPause: !!(myRole?.roleTags.includes('managePlay')),
          playerSkip: !!(myRole?.roleTags.includes('managePlay')),
          playerSeek: !!(myRole?.roleTags.includes('managePlay')),
          addViaSearch: !!(myRole?.roleTags.includes('managePlay')),
          queueShift: !!(myRole?.roleTags.includes('managePlay')),
          queueSort: !!(myRole?.roleTags.includes('managePlay')),
          queueDelete: !!(myRole?.roleTags.includes('managePlay')),
          queueInterrupt: !!(myRole?.roleTags.includes('managePlay')),
          queueMoveToTop: !!(myRole?.roleTags.includes('managePlay')),
          addFromHistory: !!(myRole?.roleTags.includes('managePlay')),
          manageUser: !!(myRole?.roleTags.includes('manageUser')),
        }
        :
        // anarchimsRoom
        roleBook['managePlay']
      ;
      return role
    }
  }

  get room() {
    return room;
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
