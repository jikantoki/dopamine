<template lang="pug">
  v-main
    v-card.wrap-div
      v-tabs(v-model="tab" bg-color="primary" fixed-tabs)
        v-tab(value="player") Player
        v-tab(value="file") File
        v-tab(value="settings") Settings
      v-card.wrap-item
        v-window(v-model="tab" style="height: 100%")
          v-window-item.player-window(value="player")
            playerTab(
              :filename="nowPlaying"
              :status="playStatus"
              ref="playerTab"
              @prev="prev"
              @play="play"
              @pause="pause"
              @next="next"
            )
          v-window-item.player-window(value="file")
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
          v-window-item.player-window(value="settings")
            p Settings
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
          /** ファイル */
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
    /** 楽曲再生 */
    play(filename, folderIndex, fileIndex) {
      /** 現在再生しているファイルと今から再生するファイルが違う場合はTrue */
      let newfile = false
      if (filename) {
        if (this.nowPlaying && filename.address != this.nowPlaying.address)
          newfile = true
        this.nowPlaying = filename
        this.current = {
          folderIndex: folderIndex,
          fileIndex: fileIndex,
        }
        //何も再生されてない場合、先頭の楽曲を再生
      } else if (!this.nowPlaying) {
        newfile = true
        this.nowPlaying = this.files[0].files[0]
        this.current = {
          folderIndex: 0,
          fileIndex: 0,
        }
      }
      if (newfile) {
        CapacitorMusicControls.create({
          track: this.nowPlaying.title, // optional, default : ''
          artist: this.nowPlaying.artist, // optional, default : ''
          album: this.nowPlaying.album, // optional, default: ''
          cover: `thumbnail_default.jpg`, // optional, default : nothing

          // hide previous/next/close buttons:
          hasPrev: false, // show previous button, optional, default: true
          hasNext: false, // show next button, optional, default: true
          hasClose: true, // show close button, optional, default: false

          // Android only, all optional
          isPlaying: true, // default : true
          dismissable: true, // default : false
          playIcon: 'media_play',
          pauseIcon: 'media_pause',
          prevIcon: 'media_prev',
          nextIcon: 'media_next',
          closeIcon: 'media_close',
          notificationIcon: 'notification',
          ticker: this.nowPlaying.title,
        })
          .then(() => {
            // SUCCESS
          })
          .catch((e) => {
            console.log(e)
          })
        // TODO: Update playback state.
      }
      CapacitorMusicControls.updateIsPlaying({
        isPlaying: true, // affects Android only
      })
      const th = this
      setTimeout(function () {
        th.$refs.player.play()
        th.playStatus = true
      }, 1)
    },
    pause() {
      this.$refs.player.pause()
      this.playStatus = false
      CapacitorMusicControls.updateIsPlaying({
        isPlaying: false, // affects Android only
      })
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
    //全曲タグ検索する
    this.files.forEach(async (folder, folderIndex) => {
      folder.files.forEach(async (file, fileIndex) => {
        const res = await fetch(file.address)
        const arybuf = await res.arrayBuffer()
        const mp3tag = new MP3Tag(arybuf)
        mp3tag.read()
        if (mp3tag.error !== '') throw new Error(mp3tag.error)
        this.files[folderIndex].files[fileIndex].title = mp3tag.tags.title
        if (!this.files[folderIndex].files[fileIndex].title) {
          this.files[folderIndex].files[fileIndex].title = file.address
        }
        this.files[folderIndex].files[fileIndex].artist = mp3tag.tags.artist
        this.files[folderIndex].files[fileIndex].album = mp3tag.tags.album
        if (mp3tag.tags.v2.APIC) {
          const fileType = mp3tag.tags.v2.APIC[0].type
          //サムネイルはUnit8Array型式になっているので、Base64に変換する
          const unit8array = new Uint8Array(mp3tag.tags.v2.APIC[0].data)
          const base64 = btoa(
            [...unit8array].map((n) => String.fromCharCode(n)).join('')
          )
          this.files[folderIndex].files[
            fileIndex
          ].thumbnail = `data:${fileType};base64,${base64}`
        }
      })
    })

    //終わったら次の曲の再生
    this.$refs.player.addEventListener('ended', () => this.next())

    CapacitorMusicControls.create({
      track: 'Dopamine', // optional, default : ''
      cover: `thumbnail_default.jpg`, // optional, default : nothing

      // hide previous/next/close buttons:
      hasPrev: false, // show previous button, optional, default: true
      hasNext: false, // show next button, optional, default: true
      hasClose: true, // show close button, optional, default: false

      // Android only, all optional
      isPlaying: false, // default : true
      dismissable: true, // default : false
      playIcon: 'media_play',
      pauseIcon: 'media_pause',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: 'notification',
      ticker: 'Dopamine',
    })

    //端末側の楽曲コントロールの命令用
    const th = this
    document.addEventListener('controlsNotification', (event) => {
      switch (event.message) {
        case 'music-controls-previous':
          th.prev()
          break
        case 'music-controls-play':
          th.play()
          break
        case 'music-controls-pause':
          th.pause()
          break
        case 'music-controls-next':
          th.next()
          break
        default:
          break
      }
    })
  },
}
</script>

<style lang="scss">
.wrap-div {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100vh;
  width: 100vw;
  .wrap-item {
    flex: 1;
    .player-window {
      height: 100%;
    }
  }
}
</style>
