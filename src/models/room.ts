import PlayerStatus from './playerStatus';

interface Player {
  source: string;
  status: PlayerStatus;
  updatedAt: number;
  playedTime: number;
}

interface Queue {
  source: string;
  platform: string;
}

interface Room {
  roomId: string;
  queues: Queue[];
  player: Player;
  users: string[];
}

export default Room;
