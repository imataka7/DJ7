import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const firestore = admin.firestore();
const { arrayRemove } = admin.firestore.FieldValue;

async function leaveRooms(uid: string, roomIds: string[]) {
  const tasks = roomIds.map(async id => {
    const ref = firestore.doc(`rooms/${id}`);
    const room = (await ref.get()).data() as { users: { uid: string }[] };

    const me = room.users.find(u => u.uid === uid);

    if (!me) {
      return;
    }

    return ref.set({
      users: arrayRemove(me),
    }, { merge: true });
  });

  return Promise.all(tasks);
}

exports.onUserStatusChagned = functions.database.ref('/status/{uid}')
  .onUpdate(async (change, context) => {
    const eventStatus = change.after.val();

    const userStatusFirestoreRef = firestore.doc(`presences/${context.params.uid}`);

    const statusSnapshot = await change.after.ref.once('value');
    const status = statusSnapshot.val();

    if (status.last_changed > eventStatus.last_changed) {
      return null;
    }

    eventStatus.last_changed = new Date(eventStatus.last_changed);

    if (eventStatus.state === 'offline') {
      const firestoreSnapshot = (await userStatusFirestoreRef.get()).data() as { rooms: string[] };
      const rooms = firestoreSnapshot.rooms || [];
      await leaveRooms(context.params.uid, rooms);
      eventStatus.rooms = [];
    }

    return userStatusFirestoreRef.set(eventStatus, { merge: true });
  });

exports.getVideoList = functions.https.onCall(async (data, cxt) => {
  const uids = ['tcxUGMgaQWPyeJHdZFIJTmn0Ssz2'];
  const list = [];
  for (const uid of uids) {
    const ref = await firestore.doc(`users/${uid}`).get();
    const { history } = ref.data() as { history: any[] };
    list.push(...history);
  }

  return list;
});