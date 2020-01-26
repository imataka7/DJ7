import {
  VuexModule, Mutation, Action, Module, getModule, MutationAction,
} from 'vuex-module-decorators';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { app as firebaseApp } from '@/plugins/firebase';
import store from '..';
import Music from '@/models/music';
import User from '@/models/user';
import getClone from '@/utils/getClone';
import setEvent from '@/utils/eventUtil';

const firestore = firebaseApp.firestore();
const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Module({
  name: 'User', namespaced: true, store, dynamic: true,
})
class FirebaseUser extends VuexModule {
  public user: firebase.User | null = null;

  public status: User | null = null;

  public listener: (() => void) | null = null;

  get history() {
    return this.status?.history;
  }

  get userRef() {
    return firestore.collection('users').doc(this.user?.uid);
  }

  @Mutation
  public setUser(user: firebase.User) {
    this.user = user;
  }

  @Mutation
  public setStatus(state: User) {
    this.status = state;
  }

  @Mutation
  public setListener(listener: () => void) {
    this.listener = listener;
    setEvent(window, 'beforeunload', () => listener);
  }

  @Action({})
  public async init(user: firebase.User) {
    this.setUser(user);

    const userSnapshot = await this.userRef.get();

    if (!userSnapshot.exists) {
      const initial = {
        uid: user.uid,
        history: [],
      };
      await this.userRef.set(initial);
      this.setStatus(initial);
    } else {
      this.setStatus(userSnapshot.data() as User);
    }

    const listener = this.userRef.onSnapshot(async (doc) => {
      this.setStatus(doc.data() as User);
    });

    this.setListener(listener);
  }

  @Action({})
  public async updateHistory(music: Music) {
    if (!this.status) {
      return;
    }

    const history = getClone(this.history)!;
    const i = history.findIndex(h => h.source === music.source);

    if (i > -1) {
      const item = history[i];
      history.splice(i, 1);
      // item.count += 1;
      history.push(item);
    } else {
      history.push(music);
    }

    if (history.length > 2000) {
      history.splice(0, history.length - 2000);
    }

    await this.userRef.update({
      history,
    });
  }

  @Action({})
  public deleteHistoryItem(music: Music) {
    this.userRef.update({
      history: arrayRemove(music),
    });
  }

  @MutationAction({ mutate: ['user', 'status', 'listener'] })
  public async signOut() {
    this.listener?.();

    await firebase.auth().signOut();

    return {
      user: null,
      status: null,
      listener: null,
    };
  }
}

export default getModule(FirebaseUser);
