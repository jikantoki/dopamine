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
            playerTab(
              :filename="nowPlaying"
              :status="playStatus"
              ref="playerTab"
              @prev="prev"
              @play="play"
              @pause="pause"
              @next="next"
            )
          v-window-item(value="file")
            filesTab(
              :files="files"
              :status="playStatus"
              @play="play"
              :currentFilename="nowPlaying"
              @prevButton="prev"
              @playButton="play"
              @pauseButton="pause"
              @nextButton="next"
            )
          v-window-item(value="settings") Settings
  audio(:src="nowPlaying ? nowPlaying.address : null" ref="player")
</template>

<script>
import filesTab from '/src/components/filesTab.vue'
import playerTab from '/src/components/playerTab.vue'
import { CapacitorMusicControls } from 'capacitor-music-controls-plugin'
const MP3Tag = require('mp3tag.js')
//import { Toast } from '@capacitor/toast'

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
            {
              address: '/assets/jikantoki/01 Split.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/02 NULL.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/03 Giveme.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/04 深夜徘徊VS.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/05 ENOKI HARDCORE β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/06 ENOKI GUITARPOP β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/07 ENOKI GAMECENTER β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/08 ENOKI HARDBASS β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/09 ENOKI PROGRESSIVE HOUSE β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/10 ENOKI TECHNOPOP β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
            {
              address: '/assets/jikantoki/11 人生のタイムカプセル_初音ミク.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
            },
          ],
        },
      ],
      nowPlaying: null,
      /** 現在再生中か？Boolean */
      playStatus: false,
      /** 現在再生しているファイル位置 */
      current: {
        /** 何番目のフォルダーか */
        folderIndex: 0,
        /** 何番目のファイルか */
        fileIndex: 0,
      },
    }
  },
  methods: {
    /** 初めから楽曲再生 */
    play(filename, folderIndex, fileIndex) {
      if (filename) {
        this.nowPlaying = filename
        this.current = {
          folderIndex: folderIndex,
          fileIndex: fileIndex,
        }
      } else if (!this.nowPlaying) {
        this.nowPlaying = this.files[0].files[0]
        this.current = {
          folderIndex: 0,
          fileIndex: 0,
        }
      }
      const th = this
      setTimeout(function () {
        th.$refs.player.play()
        th.playStatus = true
        CapacitorMusicControls.create({
          track: 'Time is Running Out', // optional, default : ''
          artist: 'Muse', // optional, default : ''
          album: 'Absolution', // optional, default: ''
          cover: 'albums/absolution.jpg', // optional, default : nothing
          // cover can be a local path (use fullpath 'file:///storage/emulated/...',
          // or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
          // or a remote url ('http://...', 'https://...', 'ftp://...')
        })
          .then(() => {
            // SUCCESS
          })
          .catch((e) => {
            console.log(e)
          })
        // TODO: Update playback state.
      })
    },
    pause() {
      this.$refs.player.pause()
      this.playStatus = false
    },
    prev() {
      //同じフォルダーの前トラックへの移動を試みる
      if (
        this.files[this.current.folderIndex].files[this.current.fileIndex - 1]
      ) {
        this.play(
          this.files[this.current.folderIndex].files[
            this.current.fileIndex - 1
          ],
          this.current.folderIndex,
          this.current.fileIndex - 1
        )
        //ない場合は、前フォルダーの最後トラックへの移動を試みる
      } else if (
        this.files[this.current.folderIndex - 1] &&
        this.files[this.current.fileIndex - 1].files[0]
      ) {
        this.play(
          this.files[this.current.folderIndex - 1].files[
            this.files[this.current.folderIndex - 1].files.length - 1
          ],
          this.current.folderIndex - 1,
          this.files[this.current.folderIndex - 1].files.length - 1
        )
        //それもなければ、最後尾のフォルダーの最後尾への移動を試みる
      } else {
        this.play(
          this.files[this.files.length - 1].files[
            this.files[this.files.length - 1].files.length - 1
          ],
          this.files.length - 1,
          this.files[this.files.length - 1].files.length - 1
        )
      }
    },
    next() {
      //同じフォルダーの次トラックへの移動を試みる
      if (
        this.files[this.current.folderIndex].files[this.current.fileIndex + 1]
      ) {
        this.play(
          this.files[this.current.folderIndex].files[
            this.current.fileIndex + 1
          ],
          this.current.folderIndex,
          this.current.fileIndex + 1
        )
        //ない場合は、次フォルダーの最初のトラックへの移動を試みる
      } else if (
        this.files[this.current.folderIndex + 1] &&
        this.files[this.current.fileIndex + 1].files[0]
      ) {
        this.play(
          this.files[this.current.folderIndex + 1].files[0],
          this.current.folderIndex + 1,
          0
        )
        //それもなければ、最初のフォルダーの最初への移動を試みる
      } else {
        this.play(this.files[0].files[0], 0, 0)
      }
    },
  },
  async mounted() {
    const res = await fetch('/assets/jikantoki/01 Split.mp3')
    const arybuf = await res.arrayBuffer()
    const mp3tag = new MP3Tag(arybuf)
    mp3tag.read()
    if (mp3tag.error !== '') throw new Error(mp3tag.error)
    else console.log(mp3tag.tags)
  },
}
</script>
