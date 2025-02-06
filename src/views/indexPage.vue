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
              :duration="musicDuration"
              :currentTime="currentTime"
              :currentFolder="files[current.folderIndex].title"
              :fileIndex="current.fileIndex"
              :repeat="repeat"
              :random="random"
              :speed="speed"
              ref="playerTab"
              @prev="prev"
              @play="play"
              @pause="pause"
              @next="next"
              @move="move"
              @goFile="tab='file'"
              @random="random = !random"
              @repeat="repeat = !repeat"
              @speedChange="speedChange"
            )
          v-window-item.player-window(value="file")
            filesTab(
              :files="files"
              :status="playStatus"
              :duration="musicDuration"
              :currentTime="currentTime"
              @play="play"
              :currentFilename="nowPlaying"
              :currentFilePos="current"
              @prevButton="prev"
              @playButton="play"
              @pauseButton="pause"
              @nextButton="next"
              @move="move"
            )
          v-window-item.player-window(value="settings")
            p Settings
  audio(:src="nowPlaying ? nowPlaying.address : null" ref="player")
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { Toast } from '@capacitor/toast'
import filesTab from '/src/components/filesTab.vue'
import playerTab from '/src/components/playerTab.vue'
import { CapacitorMusicControls } from 'capacitor-music-controls-plugin'
const MP3Tag = require('mp3tag.js')
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

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
          /** 画面に表示するか？ */
          onDisplay: true,
          /** ファイル */
          files: [
            {
              address: '/assets/jikantoki/01 Split.mp3',
              title: null,
              artist: null,
              album: null,
              /** blob型式のサムネイルURL */
              thumbnail: null,
              /** blob本体 */
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/02 NULL.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/03 Giveme.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/04 深夜徘徊VS.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/05 ENOKI HARDCORE β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/06 ENOKI GUITARPOP β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/07 ENOKI GAMECENTER β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/08 ENOKI HARDBASS β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/09 ENOKI PROGRESSIVE HOUSE β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/10 ENOKI TECHNOPOP β.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
            {
              address: '/assets/jikantoki/11 人生のタイムカプセル_初音ミク.mp3',
              title: null,
              artist: null,
              album: null,
              thumbnail: null,
              thumbnailBlob: null,
              duration: 0,
            },
          ],
        },
      ],
      /** リピートするか？ */
      repeat: false,
      /** ランダム再生するか？ */
      random: false,
      /** 再生速度 */
      speed: 1.0,
      /** 再生中の曲の情報（this.files[xxx].files[xxx]の情報が入る） */
      nowPlaying: null,
      /** 現在再生中か？Boolean */
      playStatus: false,
      /** 現在表示中のサムネイルURL */
      currentThumbnail: null,
      /** 設定用ファイル保存パス */
      dataDirectory: 'dopamine-data/',
      /** 現在再生しているファイル位置 */
      current: {
        /** 何番目のフォルダーか */
        folderIndex: 0,
        /** 何番目のファイルか */
        fileIndex: 0,
      },
      /** 曲の長さ */
      musicDuration: 0,
      /** 現在の再生位置 */
      currentTime: 0,
    }
  },
  methods: {
    /**
     * 楽曲再生
     * @param {Object} filename どのファイルを再生するか？
     * @param {Number} folderIndex 何番目のフォルダー？
     * @param {Number} fileIndex 何番目のファイル？
     * @param {Boolean} standbyFlag Trueなら楽曲セットするが再生しない
     */
    async play(filename, folderIndex, fileIndex, standbyFlag = false) {
      /** 現在再生しているファイルと今から再生するファイルが違う場合はTrue */
      let newfile = false
      //再生するファイルを指定している？
      if (filename) {
        //現在再生しているファイルと、指定されているファイルが違うか？
        if (this.nowPlaying && filename.address != this.nowPlaying.address)
          newfile = true
        this.nowPlaying = filename
        this.current = {
          folderIndex: folderIndex,
          fileIndex: fileIndex,
        }
        //指定がないので、とりあえず先頭をスタンバイ
      } else if (!this.nowPlaying) {
        newfile = true
        this.nowPlaying = this.files[0].files[0]
        this.current = {
          folderIndex: 0,
          fileIndex: 0,
        }
      }
      let thumbnailURL = 'thumbnail_default.jpg'
      if (this.nowPlaying.thumbnailBlob) {
        const base64 = await this.blobToBase64(this.nowPlaying.thumbnailBlob)
        await this.writeFile('current-thumbnail.jpg', base64, false)
        thumbnailURL = await this.getUri('current-thumbnail.jpg')
      }
      if (newfile || standbyFlag) {
        CapacitorMusicControls.create({
          track: this.nowPlaying.title, // optional, default : ''
          artist: this.nowPlaying.artist, // optional, default : ''
          album: this.nowPlaying.album, // optional, default: ''
          cover: thumbnailURL, // optional, default : nothing

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
      this.$refs.player.addEventListener('loadedmetadata', () => {
        this.musicDuration = this.$refs.player.duration
      })
      // audio要素が再生中でなければ、playingフラグを切る必要がある
      if (standbyFlag) {
        if (this.$refs.player.paused) {
          CapacitorMusicControls.updateIsPlaying({
            isPlaying: false, // affects Android only
          })
        }
      } else {
        CapacitorMusicControls.updateIsPlaying({
          isPlaying: true, // affects Android only
        })
        const th = this
        setTimeout(function () {
          th.$refs.player.play()
          th.$refs.player.playbackRate = th.speed
          th.playStatus = true
        }, 1)
      }
    },
    /** 一時停止 */
    pause() {
      this.$refs.player.pause()
      this.playStatus = false
      CapacitorMusicControls.updateIsPlaying({
        isPlaying: false, // affects Android only
      })
    },
    /** 戻る */
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
          this.current.fileIndex - 1,
          this.$refs.player.paused
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
          this.files[this.current.folderIndex - 1].files.length - 1,
          this.$refs.player.paused
        )
        //それもなければ、最後尾のフォルダーの最後尾への移動を試みる
      } else {
        this.play(
          this.files[this.files.length - 1].files[
            this.files[this.files.length - 1].files.length - 1
          ],
          this.files.length - 1,
          this.files[this.files.length - 1].files.length - 1,
          this.$refs.player.paused
        )
      }
    },
    /**
     * 進む
     * @param {Boolean} [forcePlay = false] Trueにすると強制的に再生開始
     */
    next(forcePlay = false) {
      //リピートフラグが立っていたら、同じ曲を流す
      if (this.repeat) {
        this.play(
          this.files[this.current.folderIndex].files[this.current.fileIndex],
          this.current.folderIndex,
          this.current.fileIndex,
          this.$refs.player.paused && !forcePlay
        )
        this.$refs.player.currentTime = 0
        return
      }
      //ランダムフラグが立っていたら、ランダムな曲を流す
      if (this.random) {
        const getRandomInt = (max) => {
          return Math.floor(Math.random() * max)
        }
        let folderIndex
        let fileIndex
        // eslint-disable-next-line no-constant-condition
        while (true) {
          folderIndex = getRandomInt(this.files.length)
          fileIndex = getRandomInt(this.files[folderIndex].files.length)
          if (
            this.current.folderIndex != folderIndex ||
            this.current.fileIndex != fileIndex
          ) {
            break
          }
        }
        this.play(
          this.files[folderIndex].files[fileIndex],
          folderIndex,
          fileIndex,
          this.$refs.player.paused && !forcePlay
        )
        return
      }
      //同じフォルダーの次トラックへの移動を試みる
      if (
        this.files[this.current.folderIndex].files[this.current.fileIndex + 1]
      ) {
        this.play(
          this.files[this.current.folderIndex].files[
            this.current.fileIndex + 1
          ],
          this.current.folderIndex,
          this.current.fileIndex + 1,
          this.$refs.player.paused && !forcePlay
        )
        //ない場合は、次フォルダーの最初のトラックへの移動を試みる
      } else if (
        this.files[this.current.folderIndex + 1] &&
        this.files[this.current.fileIndex + 1].files[0]
      ) {
        this.play(
          this.files[this.current.folderIndex + 1].files[0],
          this.current.folderIndex + 1,
          0,
          this.$refs.player.paused && !forcePlay
        )
        //それもなければ、最初のフォルダーの最初への移動を試みる
      } else {
        this.play(
          this.files[0].files[0],
          0,
          0,
          this.$refs.player.paused && !forcePlay
        )
      }
    },
    /** 再生速度の変更 */
    speedChange(newSpeed) {
      if (newSpeed) {
        this.$refs.player.playbackRate = newSpeed
        this.speed = newSpeed
      }
    },
    /** 再生位置の移動（moveValueパーセントまで曲を進める） */
    move(moveValue) {
      /** 現在再生中の曲の長さ */
      const duration = this.$refs.player.duration
      this.$refs.player.currentTime = (duration * moveValue) / 100
    },
    /** blobをbase64に変換 */
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    },
    /**
     * ストレージにファイル書き込み
     * @param {String} path 保存パス
     * @param {*} data 保存するデータ
     * @param {boolean} [saveAsUTF8=true] 画像とか保存するときはfalse
     */
    async writeFile(path, data, saveAsUTF8 = true) {
      await Filesystem.writeFile({
        path: `${this.dataDirectory}${path}`,
        data: data,
        directory: Directory.Documents,
        encoding: saveAsUTF8 ? Encoding.UTF8 : undefined,
        recursive: true,
      })
    },
    /** ストレージからファイル読み込み */
    async readFile(path) {
      const contents = await Filesystem.readFile({
        path: `${this.dataDirectory}${path}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })
      return contents
    },
    /** ストレージからファイル削除 */
    async deleteFile(path) {
      await Filesystem.deleteFile({
        path: `${this.dataDirectory}${path}`,
        directory: Directory.Documents,
      })
    },
    /** ストレージ上のファイルのフルパスを取得（file://型式） */
    async getUri(path) {
      const contents = await Filesystem.getUri({
        path: `${this.dataDirectory}${path}`,
        directory: Directory.Documents,
      })
      return contents.uri
    },
  },
  async mounted() {
    try {
      await this.writeFile('text.txt', 'This is あ test')
      await this.readFile('text.txt')
      await this.getUri('text.txt')
      await this.deleteFile('text.txt')
    } catch (e) {
      console.log(e)
      Toast.show({ text: String(e) })
    }

    //全曲タグ検索する
    //これは非同期で実行されているので、
    //通知欄のデータ同期は手動で行う必要がある
    this.files.forEach(async (folder, folderIndex) => {
      folder.files.forEach(async (file, fileIndex) => {
        const res = await fetch(file.address)
        const arybuf = await res.arrayBuffer()
        const mp3tag = new MP3Tag(arybuf)
        mp3tag.read()
        this.files[folderIndex].files[fileIndex].title = mp3tag.tags.title
        if (!this.files[folderIndex].files[fileIndex].title) {
          this.files[folderIndex].files[fileIndex].title = file.address
        }
        this.files[folderIndex].files[fileIndex].artist = mp3tag.tags.artist
        this.files[folderIndex].files[fileIndex].album = mp3tag.tags.album
        const audio = new Audio()
        audio.src = file.address
        audio.load()
        audio.addEventListener('loadedmetadata', () => {
          this.files[folderIndex].files[fileIndex].duration = audio.duration
        })
        if (mp3tag.tags.v2.APIC) {
          const fileType = mp3tag.tags.v2.APIC[0].format
          //サムネイルはUnit8Array型式になっているので、Blobに変換する
          const unit8array = new Uint8Array(mp3tag.tags.v2.APIC[0].data)
          const blob = new Blob([unit8array], {
            type: fileType,
          })
          const blobUrl = URL.createObjectURL(blob)

          this.files[folderIndex].files[fileIndex].thumbnailBlob = blob
          this.files[folderIndex].files[fileIndex].thumbnail = blobUrl
          //最後の曲まで処理が終わったら、通知を更新するためにスタンバイを送る
          if (
            this.files.length - 1 == folderIndex &&
            this.files[folderIndex].files.length - 1 == fileIndex
          ) {
            this.play(undefined, undefined, undefined, true)
          }
        }
      })
    })

    //終わったら次の曲の再生
    this.$refs.player.addEventListener('ended', () => this.next(true))

    //通知欄の再生ボタンを準備
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

    //現在の再生位置をリアルタイムで伝える
    setInterval(() => {
      if (this.$refs.player) {
        this.currentTime = this.$refs.player.currentTime
      } else {
        this.currentTime = 0
      }
    }, 50)

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

    //スタンバイ
    this.play(undefined, undefined, undefined, true)
  },
}
</script>

<style lang="scss">
.wrap-div {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100vh;
  width: 100%;
  .wrap-item {
    flex: 1;
    .player-window {
      height: 100%;
    }
  }
}
.v-progress-linear__determinate {
  pointer-events: none;
  animation: none;
}
</style>
