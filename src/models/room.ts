import PlayerStatus from './playerStatus';

interface Player {
  source: string;
  startAt: {
    seconds: number,
    nanoseconds: number,
  };
  status: PlayerStatus;
}

interface Room {
  roomId: string;
  queues: string[];
  player: Player;
}

export default Room;
