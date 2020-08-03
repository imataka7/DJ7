<template>
  <div :class="`player-controller  ${isTheaterMode ? 'is-theater' : ''}`">
    <div class="controller-container">
      <PlayPauseButton
        v-if="role.playerPause"
        :currentStatus="currentStatus"
        :disabled="isControllerDisable"
        @play="updateStatus(1)"
        @pause="updateStatus(2)"
        class="play-pause-button"
      />

      <volume-controller
        v-model="currentVolume"
        v-if="!isPhone && !isTablet"
        class="volume-controller"
      ></volume-controller>

      <SyncButton
        :currentStatus="currentStatus"
        :disabled="isControllerDisable"
        @sync="sync"
        class="sync-button"
      />

      <playback-rate-controller
        v-model="playingSpeed"
        v-if="role.changePlaybackRate && playbackRateEnabled"
      ></playback-rate-controller>

      <div class="seek-bar-container">
        <p class="progress-container">
          <span class="progress-start">{{
            formatDuration(((range * musicDuration) | 0) / 100)
          }}</span>
          <span class="progress-slash">/</span>
          <span class="progress-end">{{ formatDuration(musicDuration) }}</span>
        </p>
        <seek-bar
          v-model="range"
          @input="isRangeDragging = true"
          @seeked="onSeeked"
          :disabled="!role.playerSeek || isControllerDisable"
          class="seek-bar"
        ></seek-bar>
      </div>

      <ForwardButton
        v-if="role.playerSkip"
        :currentStatus="currentStatus"
        :disabled="isControllerDisable"
        @forward="moveMusic('forward')"
        class="forward-button"
      />

      <div @click="togglePlayerActive" class="music-info-container">
        <div v-if="!isPhone && isPopupShowing" class="sairi-popup click-me">
          <p>クリック！</p>
        </div>
        <player-music-info :music="currentMusic"></player-music-info>
      </div>
    </div>
    <div class="player-container">
      <youtube-player
        ref="youtube"
        class="youtube-player"
        @end="onMusicEnd"
        @error="onError"
      ></youtube-player>
    </div>
  </div>
</template>

<script lang="ts" src="./script"></script>

<style lang="scss" src="./style.scss" scoped></style>
<style lang="scss" src="./style-mobile.scss"></style>
