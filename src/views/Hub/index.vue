<template>
  <div class="hub">
    <div class="swiper-container">
      <div class="columns swiper-wrapper">
        <div class="column swiper-slide input-container">
          <div class="room-desc">
            <img class="dj7-logo" :src="require('@/assets/logo.png')" alt="DJ7" />

            <div v-if="dbg" style="border: solid 1px red;">
              <div>government: {{ room.government }}</div>
              <div>adminUsers: {{ room.adminUsers }}</div>
              <div>role: {{ role }}</div>
              <div>users: {{ room && room.users }}</div>
              <div v-if="currentUser">
                <div>uid: {{ currentUser.uid }}</div>
              </div>
              <div>
                <button
                  @click="$router.push({ name: 'hub', params: { roomId }})"
                >RoomId: {{ roomId }}</button>
              </div>
              <div v-if="role.manageUser">
                <button
                  @click="$router.push({ name: 'admin', params: { roomId }})"
                >{{ `${roomId}/admin` }}</button>
              </div>
            </div>

            <p>
              RoomId: {{ roomId }}
              <share-button :room-id="roomId" :now-playing="playingMusic && playingMusic.title"></share-button>
            </p>
            <span class="version">{{ version }}</span>
          </div>

          <div class="room-users">
            <img
              v-for="u in users"
              :key="u.id"
              :src="u.photo"
              alt="icon"
              loading="lazy"
              width="50"
              height="50"
            />
          </div>

          <template v-if="role.addViaSearch">
            <input-area @parsed="addQueue" />
          </template>

          <div class="ad-container">
            <ad-square></ad-square>
          </div>

          <div class="jumper">
            <section>
              <label>
                <p class="label-desc">Do you want to change the room?</p>
                <input type="text" v-model="jumpTo" :disabled="!currentUser" placeholder="Room id" />
                <abutton @click="jump" :disabled="!currentUser">Jump</abutton>
              </label>
            </section>
            <section>
              <label class="checkbox">
                <input type="checkbox" v-model="isMonarchism" />
                monarchism
              </label>
            </section>
          </div>
          <abutton @click="signOut" :disabled="!currentUser">Sign out</abutton>
        </div>

        <div class="column swiper-slide">
          <p class="header">Queue</p>
          <div class="no-music" v-if="queues.length === 0">No music in queue</div>
          <music-queue
            v-model="queues"
            @interrupt="interrupt"
            :is-draggable="isDraggable"
            :role="role"
            class="music-list"
            v-else
          ></music-queue>
        </div>

        <div class="column swiper-slide">
          <p class="header">History</p>
          <template v-if="!currentUser">
            <div class="no-music">Only available for signed in users</div>
            <div class="button-container">
              <abutton class="is-large" @click="$router.push('/signin')">Sign in</abutton>
            </div>
          </template>
          <div class="no-music" v-else-if="history.length === 0">No music in history</div>
          <history-list
            :list="history"
            @add="addQueue"
            @del="deleteMusicFromHistory"
            class="music-list"
            v-else
          ></history-list>
        </div>
      </div>
    </div>

    <player-controller
      ref="controller"
      :is-dj="role.playerPause"
      @update="onStatusChanged"
      @end="onMusicEnded"
      @error="onError"
      @forward="forwardMusic"
      @seeked="onSeeked"
      @speed="onSpeedChanged"
    ></player-controller>
  </div>
</template>

<script lang="ts" src='./script' />

<style scoped lang="scss" src='./style.scss'/>

