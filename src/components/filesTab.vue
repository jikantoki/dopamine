<template lang="pug">
  .files-tab
    .folders(v-for="(folder, folderIndex) in files")
      .folder-title {{ folder.title }}
      .folder-file
        .play-button(v-for="(file, fileIndex) in folder.files")
          img(:src="file.thumbnail")
          p(@click="play(file, folderIndex, fileIndex)") {{ file.title ? `${file.title} - ${file.artist}` : file.address }}
    playerTabVue(
      mini=true
      :filename="currentFilename"
      :status="status"
      @prev="prevButton"
      @play="playButton"
      @pause="pauseButton"
      @next="nextButton"
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
  .folders {
    height: -webkit-fill-available;
  }
}
</style>
