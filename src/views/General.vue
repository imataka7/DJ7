<template>
  <div class="general">
    <div class="desc-container">
      <h1>MusicHub</h1>
      <template v-if="!currentUser">
        <h2>Share your moments with music!</h2>
        <abutton class="is-large" @click="$router.push('/signin')">
          Join now
        </abutton>
      </template>
      <template v-else>
        <h2>Welcome back {{ currentUser.displayName }}!</h2>
        <div class="input-field">
          <label>
            <p>Where will you go?</p>
            <input type="text" placeholder="Room id" v-model="jumpTo" />
            <button @click="jump">Jump</button>
          </label>
        </div>
        <!-- <button @click="$auth.signOut()">Sign out</button> -->
      </template>
    </div>

    <!-- <div class="demo-room">
      <div class="swiper-container">
        <div class="columns swiper-wrapper">
          <div class="column"></div>
          <div class="column"></div>
          <div class="column"></div>
        </div>
      </div>
    </div> -->

    <!-- <player-controller class="controller"></player-controller> -->
  </div>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */
import {
  Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import Hub from './Hub.vue';
import ActionButton from '@/components/molecules/ActionButton.vue';
import { PlayerController } from '@/components';

@Component({
  components: {
    Hub,
    abutton: ActionButton,
    PlayerController,
  },
})
export default class General extends Vue {
  public currentUser: firebase.User | null = null;

  public created() {
    this.$auth.onAuthStateChanged((user) => { this.currentUser = user; });
  }

  public jumpTo = '';

  public jump() {
    this.$router.push(`/${this.jumpTo}`);
  }
}
</script>

<style lang="scss" scoped>
.general {
  text-align: center;
}

.input-field {
  width: 300px;
  margin: auto;
  text-align: left;

  label {
    p {
      margin: 0;
    }
  }
}

// .controller {
//   position: fixed;
//   bottom: 0;
// }
</style>
