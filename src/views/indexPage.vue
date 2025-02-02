<template lang="pug">
  v-main
    v-card(style="height: 100%")
      v-tabs(v-model="tab" bg-color="primary" fixed-tabs)
        v-tab(value="player") Player
        v-tab(value="file") File
        v-tab(value="settings") Settings
      v-card(style="height: inherit")
        v-window(v-model="tab" style="height: 100%")
          v-window-item(value="player")
            playerTab(:filename="nowPlaying" ref="playerTab")
          v-window-item(value="file")
            filesTab(:files="files" @play="play")
          v-window-item(value="settings") Settings
</template>

<script>
import filesTab from '/src/components/filesTab.vue'
import playerTab from '/src/components/playerTab.vue'

export default {
  components: {
    filesTab,
    playerTab,
  },
  data() {
    return {
      /** 一番上のタブ用 */
      tab: null,
      /** 再生するファイル達 */
      files: [
        /** フォルダー単位 */
        {
          title: 'きのこ鍋 - ときえのき',
          /** ファイルのURL */
          files: [
            '/assets/jikantoki/01 Split.mp3',
            '/assets/jikantoki/02 NULL.mp3',
            '/assets/jikantoki/03 Giveme.mp3',
            '/assets/jikantoki/04 深夜徘徊VS.mp3',
            '/assets/jikantoki/05 ENOKI HARDCORE β.mp3',
            '/assets/jikantoki/06 ENOKI GUITARPOP β.mp3',
            '/assets/jikantoki/07 ENOKI GAMECENTER β.mp3',
            '/assets/jikantoki/08 ENOKI HARDBASS β.mp3',
            '/assets/jikantoki/09 ENOKI PROGRESSIVE HOUSE β.mp3',
            '/assets/jikantoki/10 ENOKI TECHNOPOP β.mp3',
            '/assets/jikantoki/11 人生のタイムカプセル_初音ミク.mp3',
          ],
        },
      ],
      nowPlaying: null,
    }
  },
  methods: {
    /** 初めから楽曲再生 */
    play(filename) {
      this.nowPlaying = filename
      this.$refs.playerTab.play()
    },
  },
}
</script>
