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
  provider: string;
  userName: string;
}

type PilgrimId = string | null
type RoleTag = string
type RoleTags =  Array<RoleTag>

interface AdminUser {
  uid: string;
  roleTags: RoleTags;
}

type Government = 'monarchism' | null;

interface Room {
  roomId: string;
  queues: Musicx[];
  player: Player;
  users: RoomUser[];
  pilgrimId: PilgrimId;
  adminUsers: AdminUser[];
  government: Government;
  // NOTE
  // 部屋の初期設定をmonacrchismに強制的にする以前の部屋では
  // initUserをもっていない
  initUser: { roleTags: RoleTags } | null;
}

export {
  Player,
  RoomUser,
  Musicx,
  AdminUser,
  Government,
  RoleTags,
};

export default Room;
