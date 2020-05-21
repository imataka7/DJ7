import firebase from 'firebase'
import { user, room } from '@/store/modules';
import { Role } from '@/models'
import roleBook from '@/roleBook';


// TODO
// すべてのRoomがinitUserを備えたあとは以下のソースは削除する
export const initUserPolyfill =
    (room.isMonarchism) ?
      { roleTags: [] }
      :
      { roleTags: ['managePlay'] }

const initUserRolePolyfill =
    (room.isMonarchism) ?
      roleBook['dog']
      :
    // anarchimsRoom
      roleBook['managePlay']

export const initUser = room.initUser || initUserPolyfill

export const makeCurrentRole= (currentUser: firebase.User ): Role => {
  const myRole = room.adminUsers
    .filter((adminUser) => adminUser.uid === currentUser.uid).shift();

  // roleTagsからRoleの算出規則について
  // roleBook: RoleTag -> Role
  // Array<RoleTag> -> Role
  // [ tagA, tagB ] => roleBook(tagA) + roleBook(tagB)
  // +: (roleA: Role, roleB: Role) => {
  //   roleA.alpha + roleB.alpha,  ただし論理和
  //   roleA.beta + roleB.beta,
  //   ...
  // }

  if (myRole) {
    // myRole.roleTags => role
    const roleTags = myRole.roleTags
    return {
      playerPause: !!(roleTags.includes('managePlay')),
      playerSkip: !!(roleTags.includes('managePlay')),
      playerSeek: !!(roleTags.includes('managePlay')),
      addViaSearch: !!(roleTags.includes('managePlay')),
      queueShift: !!(roleTags.includes('managePlay')),
      queueSort: !!(roleTags.includes('managePlay')),
      queueDelete: !!(roleTags.includes('managePlay')),
      queueInterrupt: !!(roleTags.includes('managePlay')),
      queueMoveToTop: !!(roleTags.includes('managePlay')),
      addFromHistory: !!(roleTags.includes('managePlay')),
      manageUser: !!(roleTags.includes('manageUser')),
    }
  } else if (room.initUser) {
    // initUser.roleTags => role
    const roleTags = room.initUser.roleTags
    return {
      playerPause: !!(roleTags.includes('managePlay')),
      playerSkip: !!(roleTags.includes('managePlay')),
      playerSeek: !!(roleTags.includes('managePlay')),
      addViaSearch: !!(roleTags.includes('managePlay')),
      queueShift: !!(roleTags.includes('managePlay')),
      queueSort: !!(roleTags.includes('managePlay')),
      queueDelete: !!(roleTags.includes('managePlay')),
      queueInterrupt: !!(roleTags.includes('managePlay')),
      queueMoveToTop: !!(roleTags.includes('managePlay')),
      addFromHistory: !!(roleTags.includes('managePlay')),
      manageUser: !!(roleTags.includes('manageUser')),
    }
  } else {
    return initUserRolePolyfill
  }
}