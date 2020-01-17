import searchVideo from './search';
import { Musicx } from '@/models/room';
import getVideoTitle from './getYTVideoTitle';

// TODO: add tests
// test cases are https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486
/**
 * Get video id from URL
 * @param url YouTube URL
 * @returns YouTube Video Id
 */
function getYTVideoId(url: string) {
  const parsed = new URL(url);

  switch (parsed.host) {
    case 'www.youtube.com':
      if (/^\/embed/.test(parsed.pathname)) {
        return parsed.pathname.replace(/^\/embed\//, '');
      } if (parsed.searchParams.get('v')) {
        return parsed.searchParams.get('v');
      }
      return '';
    case 'youtu.be':
      return parsed.pathname.slice(1);
    default:
      return '';
  }
}

/**
 * parse URL and create source for iframe
 * @param url URL to parse
 * @returns parsed URL. if failed, reuturns empty string.
 */
function getEmbedUrl(url: string) {
  if (/youtube.com|youtu.be/.test(url)) {
    const id = getYTVideoId(url);

    return id ? `https://www.youtube.com/embed/${id}?enablejsapi=1` : '';
  }

  return '';
}

/**
 * Generate randomId to identify music in queue
 */
function generateRandomId() {
  return Math.random().toString(36).slice(2);
}

async function createYTInfo(videoId: string) {
  const title = await getVideoTitle(videoId);

  return {
    source: `https://www.youtube.com/embed/${videoId}`,
    platform: 'YouTube',
    id: generateRandomId(),
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    title,
  } as Musicx;
}

/**
 * Parse given URL or search query to get music infomation
 * @param query URL to parse
 * @returns Music info if parse succeeded otherwise null
 */
async function getMusicInfo(query: string) {
  if (/^https?:\/\/(www.)?(youtube.com|youtu.be)\//.test(query)) {
    const videoId = getYTVideoId(query);

    if (videoId) {
      return createYTInfo(videoId);
    }
  } else {
    const videoId = await searchVideo(query);

    if (videoId) {
      return createYTInfo(videoId);
    }
  }

  return null;
}

export {
  getEmbedUrl,
  getYTVideoId,
  getMusicInfo,
  generateRandomId,
};
