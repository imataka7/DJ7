import {
  VuexModule, Mutation, Action, Module, getModule,
} from 'vuex-module-decorators';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { app as firebaseApp } from '@/plugins/firebase';
import store from '..';
import { Presence } from '@/models';

const firestore = firebaseApp.firestore();
const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Module({
  name: 'presence', namespaced: true, store, dynamic: true,
})
class PresenceManager extends VuexModule {
  public uid = '';

  public presence: Presence | null = null;

  public listener: (() => void) | null = null;

  get ref() {
    if (!this.uid) {
      return null;
    }

    return firestore.collection('presences').doc(this.uid);
  }

  @Mutation
  public setUid(uid: string) {
    this.uid = uid;
  }

  @Mutation
  public setPresence(presence: Presence) {
    this.presence = presence;
  }

  @Mutation
  public setListener(listener: () => void) {
    if (this.listener) {
      this.listener();
    }

    this.listener = listener;
  }

  @Action({ commit: 'setPresence' })
  public async init(uid: string) {
    this.setUid(uid);

    const snapshot = await this.ref!.get();
    this.setPresence(snapshot.data() as Presence);

    const listener = this.ref!.onSnapshot(doc => this.setPresence(doc.data() as Presence));
    this.setListener(listener);
  }

  @Action({})
  public async addRoom(roomId: string) {
    this.ref!.set({
      rooms: arrayUnion(roomId),
    }, { merge: true });
  }

  @Action({})
  public async removeRoom(roomId: string) {
    this.ref!.set({
      rooms: arrayRemove(roomId),
    }, { merge: true });
  }
}

export default getModule(PresenceManager);
