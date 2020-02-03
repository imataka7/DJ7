import YouTubePlayer from 'youtube-player';

const dummyEl = document.createElement('div');
dummyEl.style.display = 'none';
document.body.insertAdjacentElement('beforeend', dummyEl);

const player = YouTubePlayer(dummyEl, {
  playerVars: {
    enablejsapi: 1,
    origin: window.location.origin,
  },
});

/**
 * wait until playlist will be updated and returns videoId.
 * If the video would not found within 3 sec, stop waiting.
 * @returns videoId. If the video not found, returns undefined
 */
async function waitUntilPlaylistUpdated(): Promise<readonly string[] | undefined> {
  return new Promise(async (r) => {
    setTimeout(() => r(), 3000);

    const listener = player.on('stateChange', async (event) => {
      if (event.data !== 5) {
        return;
      }

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

  return list?.[0];
}
