import PlayerStates from 'youtube-player/dist/constants/PlayerStates';
import Music from './music';

interface MusicPlayer {
  init: () => Promise<void>;

  loadMusic(music: Music): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seekTo(to: number): Promise<void>;
  setVolume(vol: number): Promise<void>;
  // getCurrenPlayedTime: () => Promise<number>;
  getCurrentPlayedTime(): Promise<number>;

  currentState: PlayerStates;
}

export default MusicPlayer;
