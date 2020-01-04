import { Music } from '@/models/room';

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

/**
 * Parse given URL or search query to get music infomation
 * @param url URL to parse
 * @returns Music info if parse succeeded otherwise null
 */
function getMusicInfo(url: string): Music | null {
  if (/youtube.com|youtu.be/.test(url)) {
    const videoId = getYTVideoId(url);

    if (videoId) {
      return {
        source: `https://www.youtube.com/embed/${videoId}`,
        platform: 'YouTube',
        id: generateRandomId(),
      };
    }
  }

  return null;
}

export {
  getEmbedUrl,
  getYTVideoId,
  getMusicInfo,
};
