
interface Role {
  playerPause: boolean; // 再生中の曲の再生と停止
  playerSkip: boolean; // 再生中の曲のスキップ
  playerSeek: boolean; // シークバーの操作
  addViaSearch: boolean; // URLとクエリからの曲追加
  queueShift: boolean; // iframe曲再生終了による次の曲への移行
  queueSort: boolean; // 再生待ちキューにおける曲の並び替え操作
  queueDelete: boolean; // 再生待ちキューからの曲の削除
  queueInterrupt: boolean; // 再生待ちキューからの曲の割り込み再生
  queueMoveToTop: boolean; // 再生待ちキューにおける曲の先頭移行
  addFromHistory: boolean; // 再生履歴からの曲追加
  manageUser: boolean; // 他ユーザへの権限付与
}

export default Role;

