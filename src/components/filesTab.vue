<template lang="pug">
  .files-tab
    .folders(v-for="(folder, folderIndex) in files")
      .folder-title {{ folder.title }}
      .folder-file
        button.play-button(
          v-for="(file, fileIndex) in folder.files"
          @click="play(file, folderIndex, fileIndex)"
          :class="currentFilePos.folderIndex == folderIndex && currentFilePos.fileIndex == fileIndex ? 'now-playing' : ''"
          v-ripple
        )
          img(v-if="file.thumbnail" :src="file.thumbnail")
          .no-img(v-if="!file.thumbnail")
          .text-music-info
            p.title {{ file.title ? `${file.title} - ${file.artist}` : file.address }}
            .duration
              p {{ calcTime(file.duration) }}
    playerTabVue(
      mini=true
      :filename="currentFilename"
      :status="status"
      :duration="duration"
      :currentTime="currentTime"
      @prev="prevButton"
      @play="playButton"
      @pause="pauseButton"
      @next="nextButton"
      @move="move"
    )
</template>

<script>
import playerTabVue from './playerTab.vue'
export default {
  components: {
    playerTabVue,
  },
  props: {
    /** 読み込んだファイル達 */
    files: {
      type: Array,
    },
    /** 再生中フラグBoolean */
    status: {
      type: Boolean,
    },
    /** 今再生しているファイル名 */
    currentFilename: {
      type: String,
    },
    /** 今再生しているファイルの位置 */
    currentFilePos: {
      type: Object,
    },
    /** 再生している曲の長さ */
    duration: {
      type: Number,
      default: 0,
    },
    /** 現在の再生位置 */
    currentTime: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    /** 楽曲再生 */
    play(file, folderIndex, fileIndex) {
      this.$emit('play', file, folderIndex, fileIndex)
    },
    /** 楽曲再生 */
    playButton() {
      this.$emit('playButton')
    },
    /** 一時停止 */
    pauseButton() {
      this.$emit('pauseButton')
    },
    /** 戻る */
    prevButton() {
      this.$emit('prevButton')
    },
    /** 進む */
    nextButton() {
      this.$emit('nextButton')
    },
    /** move */
    move(moveValue) {
      this.$emit('move', moveValue)
    },
    /** 秒（Number）を分:秒（String）に変換 */
    calcTime(sec) {
      const calcedSec = Math.floor(sec % 60)
      const min = Math.floor((sec % 3600) / 60)
      return `${String(min).padStart(2, 0)}:${String(calcedSec).padStart(2, 0)}`
    },
  },
}
</script>

<style lang="scss" scoped>
img {
  height: 2em;
}
.files-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  white-space: nowrap;
  .folders {
    height: -webkit-fill-available;
    .folder-title {
      font-size: 1.3em;
      height: 2em;
      align-content: center;
      overflow: hidden;
    }
    .folder-file {
      .now-playing {
        background: rgb(var(--v-theme-surface-light));
        .text-music-info > .duration {
          background: rgb(var(--v-theme-surface-light)) !important;
        }
      }
      .play-button {
        display: flex;
        align-items: center;
        max-width: 100%;
        width: 100%;
        position: relative;
        img,
        .no-img {
          width: 3em;
          min-width: 3em;
          height: 3em;
          margin: 4px;
          border-radius: 10%;
        }
        .text-music-info {
          margin: 4px;
          display: flex;
          align-items: center;
          font-size: 1.3em;
          justify-content: space-between;
          width: -webkit-fill-available;
          font-weight: 300;
          .title {
            overflow: hidden;
          }
          .duration {
            position: absolute;
            right: 0;
            background: rgb(var(--v-theme-surface));
            padding: 4px;
            p {
              opacity: 0.5;
            }
          }
        }
      }
    }
  }
}
</style>
