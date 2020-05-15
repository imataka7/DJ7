<template>
  <div class="hub">
    <div class="swiper-container">
      <div class="columns swiper-wrapper">
        <div class="column swiper-slide input-container">
          <div class="room-desc">
            <div class="dj7-logo">
              <img :src="require('@/assets/logo.png')" alt="DJ7" />
              <fa-icon
                class="crown"
                icon="crown"
                size="lg"
                v-if="room.isMonarchism"
              ></fa-icon>
            </div>

            <div v-if="false" style="border: solid 1px red;">
              <div>government: {{ room.government }}</div>
              <div>adminUsers: {{ room.adminUsers }}</div>
              <div>role: {{ currentRole }}</div>
              <div>users: {{ room && room.users }}</div>
              <div v-if="currentUser">
                <div>uid: {{ currentUser.uid }}</div>
              </div>
              <div>
                <button
                  @click="$router.push({ name: 'hub', params: { roomId } })"
                >
                  RoomId: {{ roomId }}
                </button>
              </div>
            </div>
            <p>
              RoomId: {{ roomId }}
              <abutton
                @click="$router.push({ name: 'hub', params: { roomId } })"
              >
                Back to room
              </abutton>
            </p>
            <span class="version">{{ version }}</span>
          </div>

          <div class="share-button-container">
            <share-button
              :room-id="roomId"
              :now-playing="playingMusic && playingMusic.title"
            ></share-button>
          </div>

          <div class="room-users">
            <a v-for="u in users" :key="u.id" :href="`#${u.uid}`">
              <img :src="u.photo" alt="icon" />
            </a>
          </div>
        </div>

        <div class="column swiper-slide">
          <template v-if="!room.isMonarchism">
            <div>この部屋に管理者はいません</div>
            <button @click="$router.push({ name: 'hub', params: { roomId } })">
              部屋に戻る
            </button>
          </template>
          <template v-else-if="!currentRole.manageUser">
            <div>あなたは管理者ではありません</div>
            <button @click="$router.push({ name: 'hub', params: { roomId } })">
              部屋に戻る
            </button>
          </template>
          <template v-else>
            <div class="save-button-container">
              <abutton @click="saveSettings">Save</abutton>
            </div>
            <div
              v-for="user in users"
              :key="user.id"
              :id="uid"
              class="user-settings"
            >
              <div>
                <img :src="user.photo" alt="icon" width="50" height="50" />
              </div>
              <div>
                <p>{{ user.userName || user.uid }}</p>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    value="managePlay"
                    v-model="user.roleTags"
                  />
                  managePlay
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="manageUser"
                    v-model="user.roleTags"
                  />
                  manageUser
                </label>
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

