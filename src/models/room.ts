import PlayerStatus from './playerStatus';
import Music from './music';

interface Musicx extends Music {
  id: string;
  extraStatus?: {
    playedTime: number;
  }
}

interface Player {
  music: Musicx;
  status: PlayerStatus;
  updatedAt: number;
  playedTime: number;
}

interface RoomUser {
  uid: string;
  photo: string | null;
}

interface Room {
  roomId: string;
  queues: Musicx[];
  player: Player;
  users: RoomUser[];
}

export {
  Player,
  RoomUser,
  Musicx,
};

export default Room;
