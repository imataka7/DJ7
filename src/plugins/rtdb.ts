import firebase from 'firebase/app';
import { rtdb, firestore } from './firebase';
import { presence } from '@/store/modules';

const isOfflineForDatabase = {
  state: 'offline',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

export default async function configurePresence(uid: string) {
  const rtdbRef = rtdb.ref(`/status/${uid}`);
  const firestoreRef = firestore.collection('presences').doc(uid);

  rtdb.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === false) {
      firestoreRef.update(isOfflineForDatabase);
      return;
    }

    rtdbRef.onDisconnect().set(isOfflineForDatabase).then(function () {
      rtdbRef.set(isOnlineForDatabase);
      firestoreRef.update(isOnlineForDatabase);
    });

    firestoreRef.onSnapshot((doc) => {
      const isOnline = doc.data()?.state === 'online';
    });
  });

  await presence.init(uid);
}
