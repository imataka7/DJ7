import PlayerStatus from './playerStatus';
import Music from './music';

interface Musicx extends Music {
  id: string;
  extraStatus?: {
    playedTime: number;
  };
}

interface Player {
  music: Musicx;
  status: PlayerStatus;
  updatedAt: number;
  playedTime: number;
  playingSpeed: number;
}

interface RoomUser {
  uid: string;
  photo: string | null;
}

interface AdminUser {
  uid: string;
  roleTags: string[];
}

type Government = "monarchism" | null;

interface Room {
  roomId: string;
  queues: Musicx[];
  player: Player;
  users: RoomUser[];
  adminUsers: AdminUser[];
  government: Government;
}

export {
  Player,
  RoomUser,
  Musicx,
  Government,
};

export default Room;
