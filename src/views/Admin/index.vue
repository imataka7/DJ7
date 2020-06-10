<template>
  <div class="admin columns">
    <div class="column">
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
          <div>{{ initUserRoleTags }}</div>
          <div>government: {{ room.government }}</div>
          <div>adminUsers: {{ room.adminUsers }}</div>
          <div>role: {{ currentRole }}</div>
          <div>users: {{ room && room.users }}</div>
          <div v-if="currentUser">
            <div>uid: {{ currentUser.uid }}</div>
          </div>
          <div>
            <button @click="$router.push({ name: 'hub', params: { roomId } })">
              RoomId: {{ roomId }}
            </button>
          </div>
        </div>
        <p>
          部屋ID: {{ roomId }}
          <abutton @click="$router.push({ name: 'hub', params: { roomId } })"
            >部屋に戻る</abutton
          >
        </p>
        <span class="version">{{ version }}</span>
      </div>

      <div class="room-users">
        <a v-for="u in users" :key="u.id" :href="`#${u.uid}`">
          <img :src="u.photo" alt="icon" />
        </a>
      </div>
    </div>

    <div class="column">
      <template v-if="!room.isMonarchism">
        <div>この部屋に管理者はいません</div>
        <abutton @click="$router.push({ name: 'hub', params: { roomId } })">
          部屋に戻る
        </abutton>
      </template>
      <template v-else-if="!currentRole.manageUser">
        <div>あなたは管理者ではありません</div>
        <abutton @click="$router.push({ name: 'hub', params: { roomId } })">
          部屋に戻る
        </abutton>
      </template>
      <template v-else>
        <div class="save-button-container">
          <abutton @click="saveSettings">保存</abutton>
        </div>
        <div class="user-settings">
          <div>
            <fa-icon icon="user" size="3x" fixed-width></fa-icon>
          </div>
          <div>
            <p>初期ユーザ</p>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="managePlay"
                v-model="initUser.roleTags"
              />
              再生権限
            </label>
            <label>
              <input
                type="checkbox"
                value="manageUser"
                v-model="initUser.roleTags"
              />
              管理者権限
            </label>
          </div>
        </div>
        <div
          v-for="user in users"
          :key="user.id"
          :id="user.id"
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
              再生権限
            </label>
            <label>
              <input
                type="checkbox"
                value="manageUser"
                v-model="user.roleTags"
              />
              管理者権限
            </label>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" src='./script' />

<style lang="scss" src='../Hub/style.scss' scoped></style>
<style lang="scss" src='./style.scss' scoped></style>

