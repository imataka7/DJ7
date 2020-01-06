/* eslint-disable */

import { app as firebase } from '@/plugins/firebase';

class DataAPIUtils {
  public initialized = false;

  private keys!: string[];

  public async init() {
    const snapshot = await firebase.firestore().collection('configure').doc('cred').get();
    this.keys = snapshot.data()?.apikeys as string[];

    this.initialized = true;
  }

  public getKeys() {
    return this.keys as readonly string[];
  }
}

const apis = new DataAPIUtils();

export default async function getYTVideoTitle(id: string) {
  if (!apis.initialized) {
    await apis.init();
  }

  const base = `https://www.googleapis.com/youtube/v3/videos?id=${id}&fields=items(id,snippet(title))&part=snippet&key=`;
  const headers = new Headers();
  headers.append('Accept-Encoding', 'gzip');

  const keys = apis.getKeys();
  for (let i = 0; i < keys.length; i += 1) {
    const res = await fetch(`${base}${keys[i]}`, { headers });

    if (res.ok) {
      const videoObj = await res.json();
      return videoObj.items[0].snippet.title as string;
    }
  }
}
