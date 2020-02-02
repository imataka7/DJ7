<template>
  <div class="general">
    <div class="desc-container">
      <h1>DJ7</h1>
      <template v-if="!currentUser">
        <h2>Share your moments with everyone!</h2>
        <abutton class="is-large" @click="$router.push('/signin')">
          Join now
        </abutton>
      </template>
      <template v-else>
        <h2>Welcome back {{ currentUser.displayName }}!</h2>
        <div class="input-field">
          <p>Where will you go?</p>
          <template v-if="visitedRooms.length">
            <p>
              You've visited
              <a :href="`/${id}`" v-for="id in visitedRooms" :key="id"
                >{{ id }}
              </a>
            </p>
          </template>
          <label>
            <input
              type="text"
              placeholder="or enter Room id!"
              v-model="jumpTo"
            />
            <abutton @click="jump">Jump</abutton>
          </label>
        </div>
      </template>
    </div>

    <div class="hub-container">
      <hub></hub>
    </div>
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
import { user } from '@/store/modules';

@Component({
  components: {
    Hub,
    abutton: ActionButton,
    PlayerController,
  },
})
export default class General extends Vue {
  get currentUser() {
    return user.user;
  }

  public jumpTo = '';

  public jump() {
    if (!this.jumpTo) {
      return;
    }

    this.$router.push(`/${this.jumpTo}`);
  }

  get visitedRooms() {
    return user.visitedRooms?.filter(r => r !== 'general') || [];
  }
}
</script>

<style lang="scss" scoped>
.general {
  overflow: hidden;
  height: calc(100vh + 230px);
}

.desc-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: 230px;
  text-align: center;

  h1 {
    margin: 0;
  }
}

.input-field {
  text-align: left;
  p {
    margin: 3px;
  }
}

.hub-container {
  height: 100vh;
  overflow-y: auto;
  margin-bottom: 50px;
}
</style>
