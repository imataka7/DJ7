import PlayerStatus from './playerStatus';

interface Music {
  source: string;
  platform: string;
  id: string;
}

interface Player {
  music: Music;
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
  queues: Music[];
  player: Player;
  users: RoomUser[];
}

export {
  Music,
  Player,
  RoomUser,
};

export default Room;
