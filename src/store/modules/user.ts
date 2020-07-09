import {
  VuexModule, Mutation, Action, Module, getModule,
} from 'vuex-module-decorators';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { app as firebaseApp } from '@/plugins/firebase';
import store from '..';
import { getClone, convertProviderIdToName } from '@/utils';
import {
  RoomUser, Music, User, Musicx,
} from '@/models';
import { logger } from '@/plugins/logger';
import configurePresence from '@/plugins/rtdb';

const { setUserInfo, initUserInfo } = logger;

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

  get me(): RoomUser | null {
    if (!this.status) {
      return null;
    }

    const { uid, userName, provider, photo } = this.status;
    return {
      uid,
      photo,
      userName,
      provider,
    };
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

  @Action({ rawError: true })
  public async init(user: firebase.User) {
    this.setUser(user);

    const userSnapshot = await this.userRef!.get();

    const { uid, displayName, photoURL, providerData } = user;
    const provider = convertProviderIdToName(providerData[0]!.providerId);
    const userData = {
      provider,
      photo: photoURL || '',
      userName: displayName || '',
    };

    if (!userSnapshot.exists) {
      const initial: User = {
        uid,
        history: [],
        visitedRooms: [],
        ...userData,
      };
      await this.userRef!.set(initial);
      this.setStatus(initial);
    } else {
      await this.userRef!.update({
        ...userData,
      });
      const d = userSnapshot.data() as User;
      this.setStatus({
        ...d,
        ...userData,
      });
    }

    const listener = this.userRef!.onSnapshot(async (doc) => {
      this.setStatus(doc.data() as User);
    });
    this.setListener(listener);

    setUserInfo({
      uid,
      provider,
      username: userData.userName,
    });

    configurePresence(uid);
  }

  @Action({ rawError: true })
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
      // const { id, extraStatus, ...item } = music;
      // history.push(item);
      delete music.id;
      delete music.extraStatus;
      history.push(music);
    }

    if (history.length > 2000) {
      history.splice(0, history.length - 2000);
    }

    await this.userRef!.update({
      history,
    });
  }

  @Action({ rawError: true })
  public deleteHistoryItem(music: Music) {
    this.userRef!.update({
      history: arrayRemove(music),
    });
  }

  @Action({ rawError: true })
  public async addVisitedRooms(roomId: string) {
    if (this.visitedRooms && this.visitedRooms.indexOf(roomId) > -1) {
      return;
    }

    await this.userRef!.update({
      visitedRooms: arrayUnion(roomId),
    });
  }

  @Action({ rawError: true })
  public async signOut() {
    this.listener?.();

    await firebase.auth().signOut();

    this.setUser(null);
    this.setStatus(null);
    this.setListener(null);

    initUserInfo();
  }
}

export default getModule(FirebaseUser);
