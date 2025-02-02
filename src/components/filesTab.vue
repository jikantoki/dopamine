<template lang="pug">
  .files-tab
    .folders(v-for="(folder, folderIndex) in files")
      .folder-title {{ folder.title }}
      .folder-file
        .play-button(v-for="(file, fileIndex) in folder.files")
          p(@click="play(file)") {{ file }}

</template>

<script>
export default {
  props: {
    /** 読み込んだファイル達 */
    files: {
      type: Array,
    },
  },
  methods: {
    /** 初めから楽曲再生 */
    play(filename) {
      this.$emit('play', filename)
    },
  },
}
</script>
