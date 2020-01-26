import Music from '@/models/music';

interface User {
  uid: string;
  history: Music[];
  visitedRooms?: string[];
}


export default User;
