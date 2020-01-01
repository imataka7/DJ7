import PlayerStatus from './playerStatus';

interface PlayerController {
  play: () => void;
  pause: () => void;
  setStatus: (status: PlayerStatus, seekTo: number) => void;
}

export default PlayerController;
