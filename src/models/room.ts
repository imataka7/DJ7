import PlayerStatus from './playerStatus';

interface Player {
  source: string;
  status: PlayerStatus;
  updatedAt: number;
  playedTime: number;
}

interface Room {
  roomId: string;
  queues: string[];
  player: Player;
  users: string[];
}

export default Room;
