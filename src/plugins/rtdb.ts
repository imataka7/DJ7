import firebase from 'firebase/app';
import { rtdb, firestore } from './firebase';

const isOfflineForDatabase = {
  state: 'offline',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

export default function configurePresence(uid: string) {
  const rtdbRef = rtdb.ref(`/status/${uid}`);
  const firestoreRef = firestore.collection('presences').doc(uid);

  rtdb.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === false) {
      firestoreRef.set(isOfflineForDatabase);
      return;
    }

    rtdbRef.onDisconnect().set(isOfflineForDatabase).then(function () {
      rtdbRef.set(isOnlineForDatabase);
      firestoreRef.set(isOnlineForDatabase);
    });

    firestoreRef.onSnapshot((doc) => {
      const isOnline = doc.data()?.state === 'online';
    });
  });
}
