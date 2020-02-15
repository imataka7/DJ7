import {
  VuexModule, Mutation, Action, Module, getModule, MutationAction,
} from 'vuex-module-decorators';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { app as firebaseApp } from '@/plugins/firebase';
import store from '..';
import { getClone, setEvent, convertProviderIdToName } from '@/utils';
import {
  RoomUser, Music, User, Musicx,
} from '@/models';
import { setUserInfo } from '@/logger';

const firestore = firebaseApp.firestore();
const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;

@Module({
  name: 'user', namespaced: true, store, dynamic: true,
})
class FirebaseUser extends VuexModule {
  public user: firebase.User | null = null;

  public status: User | null = null;

  public listener: (() => void) | null = null;

  get history() {
    return this.status?.history;
  }

  get visitedRooms() {
    return this.status?.visitedRooms;
  }

  get me() {
    if (!this.user) {
      return null;
    }

    return {
      uid: this.user.uid,
      photo: this.user.photoURL,
    } as RoomUser;
  }

  get userRef() {
    if (!this.user) {
      return null;
    }

    return firestore.collection('users').doc(this.user?.uid);
  }

  @Mutation
  public setUser(user: firebase.User | null) {
    this.user = user;
  }

  @Mutation
  public setStatus(state: User | null) {
    this.status = state;
  }

  @Mutation
  public setListener(listener: (() => void) | null) {
    this.listener = listener;
  }

  @Action({})
  public async init(user: firebase.User) {
    this.setUser(user);

    const userSnapshot = await this.userRef!.get();

    if (!userSnapshot.exists) {
      const initial = {
        uid: user.uid,
        history: [],
      };
      await this.userRef!.set(initial);
      this.setStatus(initial);
    } else {
      this.setStatus(userSnapshot.data() as User);
    }

    const listener = this.userRef!.onSnapshot(async (doc) => {
      this.setStatus(doc.data() as User);
    });

    this.setListener(listener);

    const {
      uid, displayName, providerData,
    } = this.user!;

    const userInfo = {
      provider: convertProviderIdToName(providerData[0]!.providerId),
      uid,
      username: displayName || '',
    };

    setUserInfo(userInfo);
  }

  @Action({})
  public async updateHistory(music: Musicx) {
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
      const { id, extraStatus, ...item } = music;
      history.push(item);
    }

    if (history.length > 2000) {
      history.splice(0, history.length - 2000);
    }

    await this.userRef!.update({
      history,
    });
  }

  @Action({})
  public deleteHistoryItem(music: Music) {
    this.userRef!.update({
      history: arrayRemove(music),
    });
  }

  @Action({})
  public async addVisitedRooms(roomId: string) {
    if (this.visitedRooms && this.visitedRooms.indexOf(roomId) > -1) {
      return;
    }

    await this.userRef!.update({
      visitedRooms: arrayUnion(roomId),
    });
  }

  @Action({})
  public async signOut() {
    this.listener?.();

    await firebase.auth().signOut();

    this.setUser(null);
    this.setStatus(null);
    this.setListener(null);
  }
}

export default getModule(FirebaseUser);
