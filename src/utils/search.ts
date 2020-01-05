import YouTubePlayer from 'youtube-player';
import sleep from './sleep';

const dummyEl = document.createElement('div');
dummyEl.style.display = 'none';
document.body.insertAdjacentElement('beforeend', dummyEl);

const player = YouTubePlayer(dummyEl);

async function waitUntilPlaylistUpdated(): Promise<readonly string[] | undefined> {
  return new Promise(async (r) => {
    setTimeout(() => r(), 5000);

    const listener = player.on('stateChange', async (event) => {
      const list = await player.getPlaylist();

      if (list) {
        // @ts-ignore
        player.off(listener);
        r(list);
      }
    });
  });
}

/**
 * search a video on YouTube
 * @param query query to saerch. if the video not found, returns undefined
 * @returns video id
 */
export default async function searchVideo(query: string) {
  await player.cuePlaylist({
    listType: 'search',
    list: query,
  });

  const list = await waitUntilPlaylistUpdated();

  await sleep(100);

  return list?.[0];
}
