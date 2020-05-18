import { Component, Vue } from 'vue-property-decorator';
import 'firebase/firestore';
import Swiper from 'swiper';
import {
  YoutubePlayer,
  InputArea,
  MusicQueue,
  HistoryList,
  PlayerController,
  ShareButton,
  AdSquare,
} from '@/components';
import { Role } from '@/models';
import { setEvent, showToast } from '@/utils';
import { user, room } from '@/store/modules';
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
    AdSquare,
  },
})
export default class Hub extends Vue {
  users: Array<{
    uid: string;
    photo: string;
    roleTags: string[];
  }> = [];

  public async saveSettings() {
    try {
      await room.updateAdminUsers(this.users);
      showToast('success', 'Your settings have been saved');
    } catch {
      showToast('error', 'Failed to save your settings');
    }
  }

  get dbg() {
    return process.env.NODE_ENV === 'development'
  }

  // RoleTagから論理話をとってDJ操作の可不可を算出
  // (Government, Array<RoleTag>) -> Boolean
  get currentRole(): Role {
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
          allowTouchMove: false,
        },
      },
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

    // initialize this.users
    const userList = room?.users || [];
    const users = [...userList].reverse();
    const userDict = Object.assign({}, ...users.map((u) => ({ [u.uid]: u })));
    const adminuserDict = Object.assign({}, ...this.room.adminUsers.map((u) => ({ [u.uid]: u })));
    const roleTagedUsers: Array<{
      uid: string;
      photo: string;
      roleTags: string[];
    }> = Object.keys(userDict).map(uid =>
      Object.assign({ roleTags: [] }, userDict[uid], adminuserDict[uid]),
    );
    this.users = roleTagedUsers;
  }
}
