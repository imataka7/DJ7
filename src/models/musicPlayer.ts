import Music from './music';
import PlayerStatus from './playerStatus';

interface MusicPlayer {
  platform: string;
  state: PlayerStatus;

  loadMusic(music: Music): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seekTo(to: number): Promise<void>;
  setVolume(vol: number): Promise<void>;
  setSpeed(speed: number): Promise<void>;
  // getCurrenPlayedTime: () => Promise<number>;
  getCurrentPlayedTime(): Promise<number>;
  getDuration(): Promise<number>;

  init: () => Promise<void>;
}

export default MusicPlayer;
