<template lang="pug">
  .files-tab
    .folders-wrap
      v-btn.remove-all(
        append-icon="mdi-trash-can"
        color="red"
        size="x-large"
        v-show="editScreen"
        @click="remove('all')"
      ) Remove All
      .folders(v-for="(folder, folderIndex) in files")
        .folder-title(
          @click="toggleFolder(folderIndex)"
        )
          v-btn.remove-icon(
              v-show="editScreen"
              icon="mdi-trash-can"
              variant="text"
              @click.stop="remove('folder', folderIndex)"
          )
          p.folder-title-p {{ folder.title }}({{ folder.files.length }})
          v-icon.folder-hidden-icon {{ folder.onDisplay ? 'mdi-folder-open-outline' : 'mdi-folder' }}
        .folder-file(v-show="folder.onDisplay")
          button.play-button(
            v-for="(file, fileIndex) in folder.files"
            @click="play(file, folderIndex, fileIndex)"
            :class="currentFilePos.folderIndex == folderIndex && currentFilePos.fileIndex == fileIndex ? 'now-playing' : ''"
            v-ripple
          )
            v-btn.remove-icon(
              v-show="editScreen"
              icon="mdi-trash-can"
              variant="text"
              @click.stop="remove('file', folderIndex, fileIndex)"
            )
            img(v-if="file.thumbnail" :src="file.thumbnail")
            .no-img(v-if="!file.thumbnail")
            .text-music-info
              p.title {{ file.title ? `${file.title} - ${file.artist}` : getFilename(file.address) }}
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
    .command-space
      .loading(v-show="!fileLoaded")
        p.mx-4.loading-p Now loading...
        v-progress-circular(indeterminate)
      v-btn(
        icon="mdi-reload"
        size="large"
        variant="text"
        @click="reload"
        v-show="fileLoaded"
      )
      v-btn(
        icon="mdi-plus"
        size="large"
        variant="text"
        :disabled="editScreen"
        @click="addFiles"
        v-show="fileLoaded"
      )
      v-btn(
        icon="mdi-minus"
        size="large"
        variant="text"
        @click="editScreen = !editScreen"
        :disabled="!files[0]"
        v-show="fileLoaded"
      )
      v-btn(
        icon="mdi-magnify"
        size="large"
        variant="text"
        disabled
      )
</template>

<script>
import playerTabVue from './playerTab.vue'
export default {
  components: {
    playerTabVue,
  },
  data() {
    return {
      /** 楽曲選択画面か？ */
      editScreen: false,
    }
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
    /** ファイルが全て読み込み済みか？ */
    fileLoaded: {
      type: Boolean,
      default: true,
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
    toggleFolder(folderIndex) {
      this.$emit('toggleFolder', folderIndex)
    },
    reload() {
      this.$emit('reload')
    },
    addFiles() {
      this.$emit('addFiles')
    },
    getFilename(path) {
      const splited = path.split('/')
      return splited[splited.length - 1]
    },
    /**
     * ファイルの削除
     * @param {string} type 'folder'または'file'または'all'
     * @param {number} folderIndex 何番目のフォルダーを消すか？
     * @param {number} fileIndex 何番目のファイルを消すか？
     */
    remove(type, folderIndex, fileIndex) {
      this.$emit('remove', type, folderIndex, fileIndex)
    },
    closeEdit() {
      this.editScreen = false
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
  overflow: hidden;
  overflow-y: auto;
  .folders-wrap {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    .remove-all {
      width: 100%;
    }
    .folders {
      .folder-title {
        font-size: 1.3em;
        height: 2em;
        overflow: hidden;
        position: relative;
        background-color: #305030;
        display: flex;
        align-items: center;
        .remove-icon {
          color: red;
        }
        .folder-hidden-icon {
          position: absolute;
          top: 50%;
          transform: translate(0%, -50%);
        }
        .folder-title-p {
          left: 0.1em;
        }
        .folder-hidden-icon {
          right: 0.1em;
        }
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
          .remove-icon {
            color: red;
          }
          img,
          .no-img {
            width: 3em;
            min-width: 3em;
            height: 3em;
            margin: 4px;
            border-radius: 10%;
            object-fit: cover;
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
  .command-space {
    background: rgb(var(--v-theme-surface-light));
    display: flex;
    justify-content: space-between;
    align-items: center;
    .loading {
      display: flex;
      .loading-p {
        font-size: 1.3em;
      }
    }
  }
}
</style>
