import { functions } from '@/plugins/firebase';
import { Music } from '@/models';

const premadeList: Music[] = [];

async function getVideoList(): Promise<Music[]> {
  const videoList = localStorage.videoList ? JSON.parse(localStorage.videoList) : null;
  if (videoList && (Date.now() - videoList.fetchedAt) < 86400 * 30 * 1000) {
    return videoList.list as Music[];
  }

  const r = await functions.httpsCallable('getVideoList')();
  const list = r.data as Music[];

  localStorage.videoList = JSON.stringify({
    list,
    fetchedAt: Date.now(),
  });

  return list;
}

function pickOne<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * (arr.length - 1))];
}

export default async function getRandomVideo(history: Music[]) {
  if (!premadeList.length) {
    const list = await getVideoList();
    premadeList.push(...list);
  }

  return pickOne([...premadeList, ...history]);
}