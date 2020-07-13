const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const firestore = admin.firestore();
const { arrayRemove } = admin.firestore.FieldValue;

async function leaveRooms(uid, roomIds) {
  const tasks = roomIds.map(id => {
    const ref = firestore.doc(`rooms/${id}`);
    const room = (await ref.get()).data();

    const me = room.users.find(u => u.uid === uid);

    if (!me) {
      return;
    }

    return ref.update({
      users: arrayRemove(me),
    });
  });

  return Promise.all(tasks);
}

exports.onUserStatusChagned = functions.database.ref('/status/{uid}')
  .onUpdate(async (change, context) => {
    const eventStatus = change.after.val();

    const userStatusFirestoreRef = firestore.doc(`status/${context.params.uid}`);

    const statusSnapshot = await change.after.ref.once('value');
    const status = statusSnapshot.val();

    if (status.last_changed > eventStatus.last_changed) {
      return null;
    }

    eventStatus.last_changed = new Date(eventStatus.last_changed);

    if (eventStatus.state === 'offline') {
      const rooms = status.rooms || [];
      await leaveRooms(context.params.uid, rooms);
    }

    return userStatusFirestoreRef.update(eventStatus);
  });