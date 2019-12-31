import PlayerStatus from './playerStatus';

interface PlayerController {
  play: () => void;
  pause: () => void;
  setStatus: (status: PlayerStatus) => void;
}

export default PlayerController;
