import { Role } from '@/models';

const roleBook: { [roleTag: string]: Role } = {
  dog: {
    playerPause: false,
    playerSkip: false,
    playerSeek: false,
    addViaSearch: false,
    queueShift: false,
    queueSort: false,
    queueDelete: false,
    queueInterrupt: false,
    queueMoveToTop: false,
    addFromHistory: false,
    changePlaybackRate: false,
    manageUser: false,
  },
  king: {
    playerPause: true,
    playerSkip: true,
    playerSeek: true,
    addViaSearch: true,
    queueShift: true,
    queueSort: true,
    queueDelete: true,
    queueInterrupt: true,
    queueMoveToTop: true,
    addFromHistory: true,
    changePlaybackRate: true,
    manageUser: true,
  },
  // dj: {
  managePlay: {
    playerPause: true,
    playerSkip: true,
    playerSeek: true,
    addViaSearch: true,
    queueShift: true,
    queueSort: true,
    queueDelete: true,
    queueInterrupt: true,
    queueMoveToTop: true,
    addFromHistory: true,
    changePlaybackRate: true,
    manageUser: false,
  },
  // admin: {
  manageUser: {
    playerPause: false,
    playerSkip: false,
    playerSeek: false,
    addViaSearch: false,
    queueShift: false,
    queueSort: false,
    queueDelete: false,
    queueInterrupt: false,
    queueMoveToTop: false,
    addFromHistory: false,
    changePlaybackRate: false,
    manageUser: true,
  },
};

export default roleBook;
