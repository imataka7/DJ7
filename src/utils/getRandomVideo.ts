import { app as firebase } from '@/plugins/firebase';
import { Music } from '@/models';

const premadeList: Music[] = [];

async function getVideoList(): Promise<Music[]> {
  return [];
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