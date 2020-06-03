<template>
  <div class="hub">
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
            <div>role: {{ role }}</div>
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
            <div v-if="role.manageUser">
              <button
                @click="$router.push({ name: 'admin', params: { roomId } })"
              >
                {{ `${roomId}/admin` }}
              </button>
            </div>
          </div>

          <p>
            部屋ID: {{ roomId }}
            <abutton
              @click="$router.push({ name: 'admin', params: { roomId } })"
            >
              設定
              <fa-icon icon="cog"></fa-icon>
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
          <img v-for="u in users" :key="u.id" :src="u.photo" alt="icon" />
        </div>

        <div class="jumper">
          <label>
            <p class="label-desc">部屋の移動/作成をする</p>
            <input
              type="text"
              v-model="jumpTo"
              :disabled="!currentUser"
              placeholder="部屋ID"
            />
          </label>
          <abutton @click="jump" :disabled="!currentUser">移動</abutton>
          <!-- <label class="checkbox">
                <input type="checkbox" v-model="isMonarchism" disabled="true" />
                作成時は権限を設定できるようにする
              </label> -->
        </div>

        <abutton @click="signOut" v-if="!currentUser">
          サインアウト
        </abutton>
        <abutton @click="$router.push('/signin')" v-else>
          サインイン
        </abutton>

        <template v-if="role.addViaSearch">
          <input-area @parsed="addQueue" />
        </template>

        <div class="ad-container">
          <ad-square></ad-square>
        </div>
      </div>

      <div class="column swiper-slide">
        <p class="header">キュー</p>
        <div class="no-music" v-if="queues.length === 0">
          キューに動画がありません
        </div>
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
        <p class="header">履歴</p>
        <template v-if="!currentUser">
          <div class="no-music">サインインしたユーザーのみが利用できます</div>
          <div class="button-container">
            <abutton class="is-large" @click="$router.push('/signin')">
              サインイン
            </abutton>
          </div>
        </template>
        <div class="no-music" v-else-if="history.length === 0">
          履歴に動画がありません
        </div>
        <history-list
          :list="history"
          @add="addQueue"
          @del="deleteMusicFromHistory"
          class="music-list"
          :role="role"
          v-else
        ></history-list>
      </div>
    </div>

    <player-controller
      ref="controller"
      :role="role"
      @update="onStatusChanged"
      @end="onMusicEnded"
      @error="onError"
      @forward="forwardMusic"
      @seeked="onSeeked"
    ></player-controller>
  </div>
</template>

<script lang="ts" src='./script' />

<style scoped lang="scss" src='./style.scss'/>

