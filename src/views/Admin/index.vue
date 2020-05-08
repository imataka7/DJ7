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
        </div>

        <div class="column swiper-slide">
          <section>government: {{ room.government }}</section>
          <template v-if="room.isMonarchism">
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
  </div>
</template>

<script lang="ts" src='./script' />

<style scoped lang="scss" src='./style.scss'/>

