/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import isMobile from 'ismobilejs';
import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';

import VolumeController from '../VolumeController.vue';
import PlayerMusicInfo from '../PlayerMusicInfo.vue';
import PlayerButtons from '../PlayerButtons.vue';
import YouTubePlayer from '../YoutubePlayer.vue';
import PlayerConfig from '../PlayerConfig.vue';
import SeekBar from '../SeekBar.vue';

import {
  MusicPlayer, Musicx, Player, PlayerStatus,
} from '@/models';
import { setEvent } from '@/utils';
import { adate } from '@/store/modules';

dayjs.extend(dayjsDuration);

interface SupportedPlatform {
  [key: string]: MusicPlayer;
}

@Component({
  components: {
    'youtube-player': YouTubePlayer,
    VolumeController,
    PlayerMusicInfo,
    PlayerButtons,
    PlayerConfig,
    SeekBar,
  },
})
export default class PlayerController extends Vue {
  @Prop({ default: false })
  public mute!: boolean;

  public log(action: string, content: Record<string, any>) {
    this.$ga.logEvent(action);
    this.$logger.info(action, { content });
  }

  public isTheaterMode = false;

  private players: SupportedPlatform = {};

  get allPlayers() {
    return Object.values(this.players);
  }

  public timer?: number;

  public async initPlayers() {
    this.players.youtube = this.$refs.youtube as unknown as MusicPlayer;

    await Promise.all(this.allPlayers.map(p => p!.init()));

    this.timer = setInterval(() => {
      if (!this.currentPlayerInfo
        || this.isControllerDisable
        || this.currentPlayerInfo.status === PlayerStatus.PAUSE
        || !this.musicDuration
        || this.isRangeDragging) {
        return;
      }

      this.updateSeekBarRange();
    }, 100);

    const v = localStorage.getItem('popup');
    if (v) {
      this.isPopupShowing = false;
    }
    await this.initVolume();

    this.listeners.push(setEvent(window, 'keydown', (e) => {
      if ((e as KeyboardEvent).keyCode === 27) { // Esc
        this.isTheaterMode = false;
      }
    }));
  }

  public listeners: ReturnType<typeof setEvent>[] = [];

  public beforeDestory() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.listeners.forEach(l => l.off());
  }

  public async updateStatus(s: PlayerStatus) {
    this.log('update_player_status', { status: s });

    if (!this.currentPlayer || this.currentPlayer!.state === PlayerStatus.BUFFERING) {
      return;
    }

    this.$emit('update', s, await this.currentPlayer.getCurrentPlayedTime());
  }

  public clearMusicInfo() {
    this.musicDuration = 0;
    this.range = 0;
  }

  public async onMusicEnd(music: Musicx) {
    this.clearMusicInfo();
    this.$emit('end', music);
  }

  public async onError(music: Musicx, code: number) {
    if (this.currentStatus === PlayerStatus.NO_MUSIC) {
      return;
    }

    this.clearMusicInfo();
    this.$emit('error', music, code);
  }

  public moveMusic(direction: 'forward' | 'backward') {
    this.log(direction, { music: this.currentMusic });

    this.clearMusicInfo();
    this.$emit(direction);
  }

  get isControllerDisable() {
    if (!this.currentPlayer) {
      return true;
    }

    const { BUFFERING, NO_MUSIC } = PlayerStatus;
    const isPlayerDisable = [BUFFERING, NO_MUSIC].some(s => s === this.currentPlayer?.state);
    const isNoMusic = this.currentStatus === PlayerStatus.NO_MUSIC;
    return isPlayerDisable || isNoMusic;
  }

  get currentMusic() {
    return this.currentPlayerInfo?.music;
  }

  private currentPlayer: MusicPlayer | null = null;

  public currentVolume = 50;

  get currentStatus() {
    return this.currentPlayerInfo?.status;
  }

  public musicDuration = 0;

  public async loadMusic(music: Musicx) {
    if (!this.currentPlayer || this.currentPlayer?.platform !== music.platform) {
      this.currentPlayer = this.allPlayers.find(p => p!.platform === music.platform)!;
    }

    this.$logger.info('load music', {
      content: {
        music,
      },
    });

    await this.currentPlayer.loadMusic(music);

    this.musicDuration = await this.currentPlayer.getDuration();

    this.updateSeekBarRange();
  }

  private async initVolume() {
    const vol = localStorage.getItem('volume') || '0';
    this.currentVolume = parseInt(vol, 10);
    await Promise.all(this.allPlayers.map(p => p!.setVolume(this.currentVolume)));
  }

  public async play() {
    await this.currentPlayer?.play();
  }

  public async pause() {
    await this.currentPlayer?.pause();
  }

  public async stop() {
    await this.currentPlayer?.stop();
  }

  public async seekTo(to: number) {
    this.updateSeekBarRange();
    this.currentPlayer?.seekTo(to);
  }

  public async getPlayedTime() {
    return this.currentPlayer?.getCurrentPlayedTime();
  }

  @Watch('currentVolume')
  public onVolumeChanged(vol: number) {
    localStorage.setItem('volume', vol.toString(10));
    this.currentPlayer?.setVolume(vol);
  }

  public range = 0;

  public currentPlayerInfo: Player | null = null;

  public isRangeDragging = false;

  public updateSeekBarRange() {
    const { updatedAt, playedTime } = this.currentPlayerInfo!;
    const diff = this.currentPlayerInfo?.status === PlayerStatus.PLAY
      ? (adate.now() - updatedAt)
      : 0;
    const per = (playedTime + diff / 1000) / this.musicDuration;

    if (per >= 1) {
      this.range = 100;
      return;
    }

    this.range = per * 100;
  }

  public onSeeked(r: number) {
    const to = r * this.musicDuration / 100;

    this.$ga.logEvent('seek');
    this.$logger.info('seek', {
      content: {
        to,
        music: this.currentMusic,
        duration: this.musicDuration,
      },
    });

    this.isRangeDragging = false;
    this.$emit('seeked', to);
  }

  public formatDuration(duration: number) {
    let d = dayjs.duration(duration * 1000);

    const h = Math.floor(d.asHours());
    d = d.subtract(h, 'hour');

    const m = Math.floor(d.asMinutes());
    d = d.subtract(m, 'minutes');

    const s = Math.floor(d.asSeconds());

    return h
      ? `${h}:${`${m}`.padStart(2, '0')}:${`${s}`.padStart(2, '0')}`
      : `${m}:${`${s}`.padStart(2, '0')}`;
  }

  public isPopupShowing = true;

  @Watch('isTheaterMode')
  public onTheaterMode() {
    localStorage.setItem('popup', JSON.stringify({ isShowing: true }));
  }

  get isPhone() {
    return isMobile().phone;
  }

  get isTablet() {
    return isMobile().tablet;
  }

  public togglePlayerActive() {
    if (this.isTheaterMode) {
      this.$ga.logEvent('enter_theater_mode');
    }

    this.isPopupShowing = false;
    this.isTheaterMode = !this.isTheaterMode;
  }

  public sync() {
    if (!this.currentPlayerInfo) {
      return;
    }

    const { updatedAt, playedTime } = this.currentPlayerInfo;
    const to = (adate.now() - updatedAt) / 1000 + playedTime;

    this.log('sync', {
      music: this.currentMusic,
      to,
      diff: to - this.range * this.musicDuration / 100,
    });

    this.seekTo(to);
  }

  public sumMovementY = 0;

  public initialPageY = 0;

  public pointerEventStartAt = 0;

  public onPointerStart() {
    if (window.innerWidth > 1240) {
      return;
    }

    if (this.isTheaterMode) {
      const el = this.$el as HTMLElement;
      el.style.removeProperty('transition');
      this.sumMovementY = 0;
      this.pointerEventStartAt = adate.now();
      this.initialPageY = 0;
    }
  }

  public onPointerMove(e: PointerEvent) {
    if (e.pressure === 0 || window.innerWidth > 1240) {
      return;
    }

    if (this.isTheaterMode) {
      const py = e.pageY;
      if (this.initialPageY === 0) {
        this.initialPageY = py;
      }

      this.sumMovementY = py - this.initialPageY;

      const el = this.$el as HTMLElement;
      if (this.sumMovementY > 0) {
        el.style.transform = `translateY(${this.sumMovementY}px)`;
      }
    }
  }

  public async onPointerEnd() {
    if (window.innerWidth > 1240) {
      return;
    }

    const el = this.$el as HTMLElement;
    el.style.removeProperty('height');
    el.style.setProperty('transition', 'height .3s ease, transform .3s ease-in-out');

    const dy = this.sumMovementY / (adate.now() - this.pointerEventStartAt);
    if (dy > 1 || this.sumMovementY > 200) {
      this.isTheaterMode = false;
    }
    el.style.removeProperty('transform');
  }

  get playingSpeed() {
    return this.currentPlayerInfo?.playingSpeed || 1;
  }

  set playingSpeed(s: number) {
    this.$emit('speed', s);
  }

  @Watch('playingSpeed')
  public onSpeedChanged(s: number) {
    this.currentPlayer?.setSpeed(s);
  }
}