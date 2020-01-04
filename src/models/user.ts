interface User {
  uid: string;
  history: {
    source: string;
    platform: string;
  }[];
}

export default User;
