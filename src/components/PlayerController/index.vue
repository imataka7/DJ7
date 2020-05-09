<template>
  <div
    :class="`player-controller  ${isTheaterMode ? 'is-theater' : ''}`"
    @pointerdown="onPointerStart"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
  >
    <div class="controller-container is-flex">
      <player-buttons
        :currentStatus="currentStatus"
        :disabled="isControllerDisable"
        :role="role"
        @play="updateStatus(1)"
        @pause="updateStatus(2)"
        @forward="moveMusic('forward')"
        @sync="sync"
      ></player-buttons>

      <volume-controller v-model="currentVolume" v-if="!isPhone && !isTablet"></volume-controller>

      <!-- <player-config v-model="playingSpeed"></player-config> -->

      <div class="seek-bar-container">
        <p class="progress-container">
          <span class="progress-start">{{ formatDuration(((range * musicDuration) | 0) / 100) }}</span>
          <span class="progress-slash">/</span>
          <span class="progress-end">{{ formatDuration(musicDuration) }}</span>
        </p>
        <seek-bar
          v-model="range"
          @input="isRangeDragging = true"
          @seeked="onSeeked"
          :disabled="!role.playerSeek || isControllerDisable"
        ></seek-bar>
      </div>

      <div @click="togglePlayerActive" class="music-info-container">
        <div v-if="!isPhone && isPopupShowing" class="click-me">
          <p>Click Me!</p>
        </div>
        <player-music-info :music="currentMusic"></player-music-info>
      </div>
    </div>
    <div class="player-container" @pointermove.stop>
      <!-- <transition>
        <div
          class="youtube-player"
          v-show="
            currentPlayer &&
              currentPlayer.platform === 'YouTube' &&
              isTheaterMode
          "
        ></div>
      </transition>-->
      <youtube-player ref="youtube" class="youtube-player" @end="onMusicEnd" @error="onError"></youtube-player>
    </div>
  </div>
</template>

<script lang="ts" src="./script"></script>

<style lang="scss" src="./style.scss"></style>
