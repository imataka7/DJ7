/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import isMobile from 'ismobilejs';
import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import {
  CODE_ESCAPE,
  CODE_LEFT,
  CODE_RIGHT,
  CODE_SPACE,
} from 'keycode-js';

import VolumeController from '../VolumeController.vue';
import PlayerMusicInfo from '../PlayerMusicInfo.vue';
import {
  PlayPauseButton,
  SyncButton,
  ForwardButton,
  PlayerButtons,
} from '@/components/PlayerButtons';
import YouTubePlayer from '../YoutubePlayer.vue';
import PlaybackRateController from '../PlaybackRateController.vue';
import SeekBar from '../SeekBar.vue';

import {
  MusicPlayer, Musicx, Player, PlayerStatus,
  Role,
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
    PlaybackRateController,
    SeekBar,
    PlayPauseButton,
    SyncButton,
    ForwardButton,
    PlayerButtons,
  },
})
export default class PlayerController extends Vue {
  @Prop({ default: false })
  public mute!: boolean;

  @Prop({ default: () => ({}) })
  role!: Role;

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
    this.configureFlags();

    this.players.youtube = this.$refs.youtube as unknown as MusicPlayer;
    this.currentPlayer = this.players.youtube;

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
      const { code } = e as KeyboardEvent;

      // esc -> Disable theater mode
      if (code === CODE_ESCAPE) {
        this.isTheaterMode = false;
      }

      // if the player is not controllable (e.g. buffering)
      if (this.isControllerDisable) {
        return;
      }

      // space -> toggle play and pause
      // if (code === CODE_SPACE && this.role.playerPause) {
      //   if (this.currentStatus === PlayerStatus.PLAY) {
      //     this.updateStatus(PlayerStatus.PAUSE);
      //   } else if (this.currentStatus === PlayerStatus.PAUSE) {
      //     this.updateStatus(PlayerStatus.PLAY);
      //   }
      // }

      // left -> seek -5 sec
      if (code === CODE_LEFT && this.role.playerSeek) {
        const currentTime = this.range * this.musicDuration / 100;
        this.seek(currentTime - 5);
      }

      // right -> seek 5 sec
      if (code === CODE_RIGHT && this.role.playerSeek) {
        const currentTime = this.range * this.musicDuration / 100;
        this.seek(currentTime + 5);
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
    // if (!this.role.queueShift) {
    //   return;
    // }

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
    // if (!this.currentPlayer || this.currentPlayer?.platform !== music.platform) {
    //   this.currentPlayer = this.allPlayers.find(p => p!.platform === music.platform)!;
    // }
    if (!this.currentPlayer) {
      return;
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
      ? (adate.now() - updatedAt) * this.playingSpeed
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
    this.seek(to);
    this.isRangeDragging = false;
  }

  public seek(to: number) {
    this.$ga.logEvent('seek');
    this.$logger.info('seek', {
      content: {
        to,
        music: this.currentMusic,
        duration: this.musicDuration,
      },
    });

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

    const { updatedAt, playedTime, status } = this.currentPlayerInfo;
    const isPlaying = status === PlayerStatus.PLAY;
    const to = isPlaying ? (adate.now() - updatedAt) * this.playingSpeed / 1000 + playedTime : playedTime;

    this.seekTo(to);

    this.log('sync', {
      music: this.currentMusic,
      to,
      diff: to - this.range * this.musicDuration / 100,
    });
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

  public playbackRateEnabled = true;

  public isVolumePopupShowing = true;

  public offVolumePopupShowing() {
    if (!this.isVolumePopupShowing) return;

    this.isVolumePopupShowing = false;
    this.saveFlags();
  }

  get flags(): Record<string, boolean> {
    return localStorage.flags ? JSON.parse(localStorage.flags) : {};
  }

  public saveFlags() {
    localStorage.flags = JSON.stringify({
      playbackRateEnabled: this.playbackRateEnabled,
      isVolumePopupShowing: this.isVolumePopupShowing,
    });
  }

  public configureFlags() {
    const { flags } = this;

    // load
    this.playbackRateEnabled = !!flags.playbackRateEnabled;
    this.isVolumePopupShowing = flags.isVolumePopupShowing === undefined ? true : !!flags.isVolumePopupShowing;

    this.$set(window, 'flags', {
      togglePlaybackRateControllerEnabled: () => {
        this.playbackRateEnabled = !this.playbackRateEnabled;
        this.saveFlags();
      },
      toggleVolumePopupEnabled: () => {
        this.isVolumePopupShowing = !this.isVolumePopupShowing;
        this.saveFlags();
      },
    });
  }
}
