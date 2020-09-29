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

async function dataAPIBase(query: string) {
  if (!apis.initialized) {
    await apis.init();
  }

  const base = `https://www.googleapis.com/youtube/v3/${query}&key=`;
  const headers = new Headers();
  headers.append('Accept-Encoding', 'gzip');

  const keys = apis.getKeys();
  for (let i = 0; i < keys.length; i += 1) {
    const res = await fetch(`${base}${keys[i]}`, { headers });

    if (res.ok) {
      return res.json();
    }

    if (res.status === 404) {
      return;
    }
  }
}

async function getYTVideoTitle(id: string) {
  const res = await dataAPIBase(`videos?id=${id}&fields=items(id,snippet(title))&part=snippet`);

  if (res) {
    return res.items[0]?.snippet.title as string;
  }
}

type PlaylistItem = { videoId: string; title: string };

function extractVideos(items: any): PlaylistItem[] {
  return items.map((i: any) => ({
    videoId: i.snippet.resourceId.videoId,
    title: i.snippet.title,
  }));
}

async function getPlaylistVideos(id: string) {
  const query = `playlistItems?playlistId=${id}&maxResults=50&fields=items(snippet(title,resourceId(videoId))),nextPageToken&part=snippet`;
  let res = await dataAPIBase(query);

  if (!res) return [];

  let { items, nextPageToken } = res;
  const results: PlaylistItem[] = [...extractVideos(items)];

  while (nextPageToken) {
    res = await dataAPIBase(`${query}&pageToken=${nextPageToken}`)

    items = res.items;
    nextPageToken = res.nextPageToken;

    const resultsPerPage = extractVideos(items);
    results.push(...resultsPerPage);
  }

  return results;
}

export {
  getYTVideoTitle,
  getPlaylistVideos,
}