<template>
  <div class="hub">
    <div class="swiper-container">
      <div class="columns swiper-wrapper">
        <div class="column swiper-slide input-container">
          <div class="room-desc">
            <img class="dj7-logo" :src="require('@/assets/logo.png')" alt="DJ7" />

            <div v-if="dbg" style="{border-style: solid; border-color: #ff0000;}">
              <div>government: {{ government }}</div>
              <div>adminUsers: {{ adminUsers }}</div>
              <div>role: {{ role }}</div>
              <div v-if="currentUser">
                <div>uid: {{ currentUser.uid }}</div>
              </div>
              <div>
                <button
                  @click="$router.push({ name: 'hub', params: { roomId }})"
                >RoomId: {{ roomId }}</button>
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

          <template v-if="isDj">
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
          <section>government: {{ government }}</section>
          <template v-if="government==='monarchism'">
            <div v-for="user in users" :key="user.id">
              <img :src="user.photo" alt="icon" width="50" height="50" />
              <div>userId: {{ user.uid }}</div>
              <div>
                managePlay
                <button @click="sw=!sw">{{ sw }}</button>
              </div>
              <div>
                manageUser
                <button @click="sw=!sw">{{ sw }}</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <player-controller
      ref="controller"
      :is-dj="isDj"
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

