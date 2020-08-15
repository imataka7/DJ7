import { Component, Vue, Watch } from 'vue-property-decorator';
import 'firebase/firestore';

import {
  YoutubePlayer,
  InputArea,
  MusicQueue,
  HistoryList,
  PlayerController,
  ShareButton,
  AdSquare,
  TabBar,
  CopyButton,
} from '@/components';
import { Room, Musicx, Music, PlayerStatus, Role } from '@/models';
import {
  getClone,
  showToast,
  getVersion,
} from '@/utils';
import { user, room, adate, presence } from '@/store/modules';
import { ActionButton } from '@/components/molecules';
import roleBook from '@/roleBook';
import { makeCurrentRole, initUserPolyfill } from '@/roleManager';
import Swal from 'sweetalert2';
import isMobile from 'ismobilejs';

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
    TabBar,
    CopyButton,
  },
})
export default class Hub extends Vue {
  isMonarchism = true

  get dbg() {
    return process.env.NODE_ENV === 'development';
  }

  get isDraggable() {
    return !this.isQueueUpdating;
  }

  get isGeneral() {
    return this.$route.name === 'hub-general';
  }

  get role(): Role {
    if (this.isGeneral) {
      return roleBook['managePlay'];
    }

    // 更新直後に権限持ってなくても一瞬だけボタンが出てしまうので
    // 最初は何も与えないように変更
    if (!room.status) {
      return roleBook['dog'];
    }

    // currentUser is null
    if (!this.currentUser) {
      return roleBook['dog'];
    }

    return makeCurrentRole(this.currentUser);
  }

  get room() {
    return room;
  }

  get version() {
    return getVersion();
  }

  get currentUser() {
    return user.user;
  }

  get me() {
    return user.me;
  }

  @Watch('me', { immediate: true })
  public onAuthStateChanged() {
    if (this.me) {
      room.addUser(this.me);
      user.addVisitedRooms(this.roomId);
      presence.addRoom(this.roomId);
    }
  }

  public async signOut() {
    this.$ga.logEvent('sign_out');

    await this.$router.push('/signin');
    await room.leaveRoom(this.me!);
    await user.signOut();
  }

  get history() {
    return user.history || [];
  }

  public isQueueUpdating = false;

  get queues() {
    return room.queues || [];
  }

  set queues(newVal) {
    if (!newVal) {
      return;
    }

    room.updateQueue(newVal);
  }

  get playingMusic() {
    return room?.player?.music;
  }

  get users() {
    const users = room?.users || [];
    return getClone(users).reverse();
  }

  private controller!: any;

  get roomId() {
    return this.$route.params.roomId || 'general';
  }

  public async init() {
    this.controller = this.$refs.controller as PlayerController;
    await this.controller.initPlayers();

    try {
      await room.init(this.roomId);
    } catch {
      await Swal.fire({
        title: '部屋が存在しません。',
        text: '部屋の作成はサインインしたユーザのみが可能です。',
        confirmButtonText: 'サインイン',
        icon: 'warning',
      });
      this.$router.push({
        path: '/signin',
        query: {
          redirect: this.roomId,
        },
      });
    }

    if (this.me) {
      room.addUser(this.me);
    }
  }

  get roomStatus() {
    return room.status;
  }

  public initialized = false;

  @Watch('roomStatus', { deep: true })
  public async onRoomStatusChanged(newStatus: Room, oldStatus: Room) {
    this.isQueueUpdating = true;

    // const previousId = oldStatus?.player.music?.id;
    const prevMusic = oldStatus?.player.music;

    this.controller.currentPlayerInfo = newStatus.player;

    setTimeout(() => {
      this.isQueueUpdating = false;
    }, 100);

    const { music, updatedAt, playedTime, status } = newStatus.player;

    if (!music || status === PlayerStatus.NO_MUSIC) {
      await this.setStatus(status, 0);
      return;
    }

    const { id, title } = music;
    const isMusicChanged = id !== prevMusic?.id && title !== prevMusic?.title;

    if (!this.initialized || isMusicChanged) {
      user.updateHistory(music);

      console.log(music, prevMusic);
      await this.controller.loadMusic(music);
    }

    if (
      this.initialized &&
      oldStatus?.player.playedTime === playedTime &&
      status === oldStatus?.player.status
    ) {
      return;
    }

    const seekTo =
      status === PlayerStatus.PLAY
        ? (adate.now() - updatedAt) / 1000 + playedTime
        : playedTime;
    console.log(seekTo, adate.now(), updatedAt, playedTime, status);

    await this.setStatus(status, seekTo);

    this.initialized = true;
  }

  private async setStatus(status: PlayerStatus, to: number) {
    await this.controller.seekTo(to);

    const { PLAY, PAUSE, NO_MUSIC } = PlayerStatus;
    switch (status) {
      case PLAY:
        await this.controller.play();
        return;
      case PAUSE:
        await this.controller.pause();
        return;
      case NO_MUSIC:
        await this.controller.stop();
        break;
      default:
    }
  }

  public async onSeeked(time: number) {
    room.seek(time);
  }

  public async updateHistory(music: Musicx) {
    await user.updateHistory(music);
  }

  public async mounted() {
    const isMobileDevice = isMobile().phone || isMobile().tablet;
    if (isMobileDevice && this.isGeneral && localStorage.stayedRoom) {
      this.$router.push(localStorage.stayedRoom);
      localStorage.removeItem('stayedRoom');
    }
    if (!this.isGeneral) {
      localStorage.stayedRoom = this.roomId;
    }

    await Promise.all([this.init()]);
  }

  // // ユーザがRoomから退出する処理
  // public beforeDestroy() {
  //   if (this.me) {
  //     room.removeUser(this.me);
  //   }
  //   room.listener?.();
  //   room.setListener(() => undefined);
  // }

  public async addQueue(items: Musicx[]) {
    room.queueMusic(items);
  }

  private onStatusChanged(status: PlayerStatus, playedTime: number) {
    room.changeState({ status, playedTime });
  }

  private async onMusicEnded(playedMusic: Musicx) {
    if (room?.player?.status === PlayerStatus.NO_MUSIC) {
      return;
    }

    const status = await room.fetchCurrentStatus();

    const { player, queues } = status;
    const { music, playedTime, updatedAt } = player;

    // チャタリング対策
    // 更新時間が近いとき
    // 再生された時間が0のときに限定しているのは
    // 一時停止のタイミングなどによって切り替わらなくなってしまうため
    const currentTime = adate.now();
    const timeElapsedFromUpdated = currentTime - updatedAt;
    const isUpdateAtTooNear = playedTime === 0 && timeElapsedFromUpdated < 2000;
    // いままでローカルで再生していた曲とDB上の曲が違うとき === 他の人がすでに切り替えている
    // なぜかidというフィールドがなくなるときがあります
    const isDifferentMusic = (playedMusic.id && music?.id)
      ? playedMusic.id !== music?.id
      : playedMusic.source !== music?.source;

    console.log(music, playedMusic, queues, timeElapsedFromUpdated);
    if (isUpdateAtTooNear || isDifferentMusic) {
      return;
    }

    this.$logger.info('music end', {
      content: {
        playedMusic,
        timeElapsedFromUpdated,
        currentTime,
        nextMusic: queues[0],
        remoteMusic: player.music,
      },
    });

    room.setMusicFromQueue(queues);
  }

  public async onError(playedMusic: Musicx, code: number) {
    const status = await room.fetchCurrentStatus();

    const { player, queues } = status;
    const { music } = player;

    // console.log(music, errorMusic);

    if (music?.id === playedMusic?.id) {
      room.setMusicFromQueue(queues);

      this.$logger.error('player error', {
        content: {
          music: playedMusic,
          code,
        },
      });
    }

    showToast('error', `エラーが発生しました。 code: ${code}`);
  }

  private async forwardMusic() {
    room.forwardMusic();
  }

  public jumpTo = '';

  public jump() {
    if (!this.jumpTo) {
      return;
    }

    localStorage.stayedRoom = this.jumpTo;

    this.$ga.logEvent('jump', {
      roomId: this.jumpTo,
    });
    this.$logger.info('jump', {
      content: {
        roomId: this.jumpTo,
      },
    });

    const { origin } = window.location;
    if (this.isMonarchism && this.currentUser?.uid) {
      window.location.href = `${origin}/${this.jumpTo.trim()}?pilgrimId=${this.currentUser.uid}`;
    } else {
      window.location.href = `${origin}/${this.jumpTo.trim()}`;
    }
  }

  public async interrupt(music: Musicx) {
    const playedTime = await this.controller.getPlayedTime();

    // if (!playedTime) {
    //   return;
    // }

    await room.interrupt({ music, playedTime: playedTime || 0 });
  }

  public async deleteMusicFromHistory(music: Music) {
    await user.deleteHistoryItem(music);
  }

  public async onSpeedChanged(speed: number) {
    const playedTime = await this.controller.getPlayedTime();
    await room.updatePlayingSpeed({ speed, playedTime });
  }

  public currentView = 'home';

  public jumpToSignin() {
    if (this.roomId !== 'general') {
      this.$router.push({ path: 'signin', query: { redirect: this.roomId } });
    } else {
      this.$router.push('/signin');
    }
  }

  public async deleteAllQueue() {
    const { value } = await Swal.fire({
      title: 'キュー全削除',
      html: 'キューを削除する場合は<code>delete</code>と入力してください。',
      input: 'text',
      inputPlaceholder: 'delete',
      showCancelButton: true,
      confirmButtonText: '削除',
      cancelButtonText: 'キャンセル',
      confirmButtonColor: '#d33',
    });

    if (value !== 'delete') return;

    await room.updateQueue([]);
    showToast('info', '削除しました');
  }

  public openDocument() {
    window.open('https://docs.dj7.io');
  }
}
