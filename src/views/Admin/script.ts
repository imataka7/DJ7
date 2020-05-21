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
import { Role, RoleTags } from '@/models';
import { setEvent, showToast } from '@/utils';
import { user, room } from '@/store/modules';
import { ActionButton } from '@/components/molecules';
import { makeCurrentRole, initUser } from '@/roleManager'
import roleBook from '@/roleBook';


type uid = string
interface UsersWithPhoto {
  uid: string;
  photo: string;
}
interface UsersWithRoleTags {
  uid: string;
  roleTags: RoleTags | null;
}
interface UserRoleProfile {
  uid: string;
  photo: string;
  roleTags: RoleTags;
}

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
  users: Array<UserRoleProfile> = []

  initUser: { roleTags: RoleTags } = { roleTags: [] }

  public async saveSettings() {
    try {
      await room.updateAdminUsers(this.users);
      await room.updateInitUser(this.initUser);
      showToast('success', '設定の保存に成功しました。');
    } catch {
      showToast('error', '設定の保存に失敗しました。');
    }
  }

  get dbg() {
    return process.env.NODE_ENV === 'development'
  }

  get currentRole(): Role {
    // currentUser is null
    if (!this.currentUser) {
      return roleBook['dog']
    }

    return makeCurrentRole(this.currentUser)
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

  public setInitUser() {
    this.initUser = initUser
  }

  public setUserRoleProfiles() {
    // initialize this.users
    const userList = room?.users || [];
    const users = [...userList].reverse();

    const recordUserWithPhoto: Record<uid, UsersWithPhoto>
      = Object.assign({}, ...users.map((u) => ({ [u.uid]: u })));

    const recordUserWithRoleTags: Record<uid, UsersWithRoleTags>
      = Object.assign({}, ...this.room.adminUsers.map((u) => ({ [u.uid]: u })));

    const userRoleProfiles: Array<UserRoleProfile>
      = Object.keys(recordUserWithPhoto).map(uid =>
        Object.assign(
          { roleTags: initUser.roleTags },
          recordUserWithPhoto[uid],
          recordUserWithRoleTags[uid],
        ),
      );
    console.log(recordUserWithRoleTags)
    console.log(userRoleProfiles)

    this.users = userRoleProfiles;
  }

  public async mounted() {

    if (window.innerWidth < 1240) {
      this.initSwiper();
    }

    setEvent(window, 'resize', this.updateSwiper);

    await Promise.all([this.init()]);

    this.setInitUser()
    this.setUserRoleProfiles()
  }
}
