import Music from '@/models/music';

interface User {
  uid: string;
  history: Music[];
  visitedRooms?: string[];
  provider: string;
  userName: string;
  photo: string;
}

export default User;
