import Music from '@/models/music';

interface User {
  uid: string;
  history: Music[];
}


export default User;
