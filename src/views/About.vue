<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p>Send to firestore at {{ firestoreTime }} by {{ updater }}</p>
    <p>You received at {{ currentTime }}</p>
    <p>Diff: {{ currentTime - firestoreTime }} seconds</p>
    <button @click="push">push</button>
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';

@Component
export default class About extends Vue {
  get ref() {
    return this.$firestore.collection('test').doc('test');
  }

  public firestoreTime: number = 0;

  public currentTime: number = 0;

  public updater = '';

  public unsubscribe: any;

  public async created() {
    const snapshot = await this.ref.get();
    const data = snapshot.data()!;
    this.firestoreTime = data.test.seconds;
    this.updater = data.pushedBy;

    this.unsubscribe = this.ref.onSnapshot((doc) => {
      this.firestoreTime = doc.data()?.test.seconds;
      this.currentTime = Math.round(Date.now() / 1000);
      this.updater = doc.data()?.pushedBy;
    });

    this.currentTime = 0;
  }

  public beforeDestroy() {
    this.unsubscribe();
  }

  public push() {
    this.ref.update({
      test: new Date(),
      pushedBy: this.$auth.currentUser?.displayName,
    });
  }
}
</script>
