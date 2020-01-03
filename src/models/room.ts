import PlayerStatus from './playerStatus';

interface Music {
  source: string;
  platform: string;
}

interface Player {
  music: Music;
  status: PlayerStatus;
  updatedAt: number;
  playedTime: number;
}

interface Room {
  roomId: string;
  queues: Music[];
  player: Player;
  users: string[];
}

export {
  Music,
  Player,
};

export default Room;
