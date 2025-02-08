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
              :currentFolder="files[0] ? files[current.folderIndex].title : ''"
              :fileIndex="current.fileIndex"
              :repeat="repeat"
              :random="random"
              :speed="speed"
              :noFile="!files[0]"
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
              ref="filesTab"
              :files="files"
              :status="playStatus"
              :duration="musicDuration"
              :currentTime="currentTime"
              @play="play"
              :currentFilename="nowPlaying"
              :currentFilePos="current"
              :fileLoaded="fileLoaded"
              @prevButton="prev"
              @playButton="play"
              @pauseButton="pause"
              @nextButton="next"
              @move="move"
              @toggleFolder="toggleFolder"
              @reload="reload"
              @addFiles="folderPicker"
              @remove="remove"
            )
          v-window-item.player-window(value="settings")
            p Settings
  audio(:src="nowPlaying ? nowPlaying.address : null" ref="player")
  v-dialog.folderPicker(
    v-model="folderPickerDialog"
    persistent
  )
    folderPicker(
      :loading="addPlaylistLoading"
      @close="folderPickerDialog = false"
      @addPlaylist="addPlaylist"
      @addPreinstall="addPreinstall"
    )
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { Toast } from '@capacitor/toast'
import filesTab from '/src/components/filesTab.vue'
import playerTab from '/src/components/playerTab.vue'
import folderPicker from '@/components/folderPicker.vue'
import { CapacitorMusicControls } from 'capacitor-music-controls-plugin'
const MP3Tag = require('mp3tag.js')
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

export default {
  components: {
    filesTab,
    playerTab,
    folderPicker,
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
      /** プリインストールの楽曲 */
      preinstallFiles: [],
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
      /** 楽曲の読み込みが完了しているか？ */
      fileLoaded: false,
      /** ストレージから設定を読み込んだフラグ */
      loadSetting: false,
      /** フォルダーピッカーが動いているか？ */
      folderPickerDialog: false,
      /** プレイリスト追加時の一時的なバッファ */
      playlistBuffer: [],
      /** プレイリスト追加時の読み込み中表示フラグ */
      addPlaylistLoading: false,
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

          duration: this.musicDuration * 1000, // Android use ms
          elapsed: this.currentTime * 1000,

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
      if (this.$refs.player) {
        this.$refs.player.addEventListener('loadedmetadata', () => {
          this.musicDuration = this.$refs.player.duration
        })
      }
      // audio要素が再生中でなければ、playingフラグを切る必要がある
      if (standbyFlag) {
        if (this.$refs.player && this.$refs.player.paused) {
          CapacitorMusicControls.updateIsPlaying({
            isPlaying: false, // affects Android only
          })
          CapacitorMusicControls.updateElapsed({
            elapsed: this.currentTime * 1000,
            isPlaying: false,
          })
        }
      } else if (this.$refs.player) {
        CapacitorMusicControls.updateIsPlaying({
          isPlaying: true, // affects Android only
        })
        CapacitorMusicControls.updateElapsed({
          elapsed: this.currentTime * 1000,
          isPlaying: true,
        })
        console.log(`${this.currentTime} / ${this.musicDuration}`)
        const th = this
        setTimeout(function () {
          th.$refs.player.play()
          th.$refs.player.playbackRate = th.speed
          th.playStatus = true
        }, 1)
      }
      //現在の状況をストレージに保存
      this.saveData()
    },
    /** 一時停止 */
    pause() {
      this.$refs.player.pause()
      this.playStatus = false
      CapacitorMusicControls.updateIsPlaying({
        isPlaying: false, // affects Android only
      })
      CapacitorMusicControls.updateElapsed({
        elapsed: this.currentTime * 1000,
        isPlaying: false,
      })
      //現在の状況をストレージに保存
      this.saveData()
    },
    /** 戻る */
    prev() {
      //ファイルがない場合何もしない
      if (!this.files[0]) {
        return
      }
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
      //現在の状況をストレージに保存
      this.saveData()
    },
    /**
     * 進む
     * @param {Boolean} [forcePlay = false] Trueにすると強制的に再生開始
     */
    next(forcePlay = false) {
      //ファイルがない場合何もしない
      if (!this.files[0]) {
        return
      }
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
      //現在の状況をストレージに保存
      this.saveData()
    },
    /** 再生速度の変更 */
    speedChange(newSpeed) {
      if (newSpeed) {
        this.$refs.player.playbackRate = newSpeed
        this.speed = newSpeed
      }
      //現在の状況をストレージに保存
      this.saveData()
    },
    /** 再生位置の移動（moveValueパーセントまで曲を進める） */
    move(moveValue) {
      /** 現在再生中の曲の長さ */
      const duration = this.$refs.player.duration
      this.$refs.player.currentTime = (duration * moveValue) / 100
      //現在の状況をストレージに保存
      this.saveData()
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
        directory: Directory.External,
        encoding: saveAsUTF8 ? Encoding.UTF8 : undefined,
        recursive: true,
      })
    },
    /**
     * ストレージからファイル読み込み
     * @param {String} path ファイルのパス
     * @param {boolean} [loadAsUTF8=true] UTF8で読み込むか？
     */
    async readFile(path, loadAsUTF8 = true) {
      const contents = await Filesystem.readFile({
        path: `${this.dataDirectory}${path}`,
        directory: Directory.External,
        encoding: loadAsUTF8 ? Encoding.UTF8 : undefined,
      })
      return contents
    },
    /** ストレージからファイル削除 */
    async deleteFile(path) {
      await Filesystem.deleteFile({
        path: `${this.dataDirectory}${path}`,
        directory: Directory.External,
      })
    },
    /** ストレージ上のファイルのフルパスを取得（file://型式） */
    async getUri(path) {
      const contents = await Filesystem.getUri({
        path: `${this.dataDirectory}${path}`,
        directory: Directory.External,
      })
      return contents.uri
    },
    /** アプリの状態をストレージに保存 */
    async saveData() {
      if (!this.fileLoaded) {
        console.log(
          'アプリがファイル読み込み中のためデータ保存をスキップしました'
        )
        return
      }
      const files = this.files.map((folder) => {
        const file = folder.files.map((file) => {
          return {
            address: file.address,
            title: file.title,
            artist: file.artist,
            album: file.album,
            duration: file.duration,
          }
        })
        return {
          title: folder.title,
          files: file,
          onDisplay: folder.onDisplay,
        }
      })
      const nowPlaying = {
        address: this.nowPlaying.address,
        title: this.nowPlaying.title,
        artist: this.nowPlaying.artist,
        album: this.nowPlaying.album,
      }
      const settings = {
        files: files,
        repeat: this.repeat,
        random: this.random,
        speed: this.speed,
        nowPlaying: nowPlaying,
        current: this.current,
        tab: this.tab,
        musicDuration: this.musicDuration,
        currentTime: this.currentTime,
      }
      try {
        await this.writeFile('settings.json', JSON.stringify(settings))
      } catch (e) {
        console.log(e)
      }
    },
    /** フォルダーの表示/非表示切り替え */
    toggleFolder(folderIndex) {
      this.files[folderIndex].onDisplay = !this.files[folderIndex].onDisplay
      this.saveData()
    },
    /**
     * 全曲タグ検索する
     * これは非同期で実行されているので、
     * 通知欄のデータ同期は手動で行う必要がある
     * @param {boolean} [forceReset=false] Trueの場合、強制で全部リロード
     * @param {boolean} [newSongOnly=false] Trueの場合、新規に入れた曲だけ
     */
    async tagSearch(forceReset = false, newSongOnly = false) {
      /**
       * @param {EventTarget} eventTarget
       * @param {string} eventName
       */
      const eventPromisify = (eventTarget, eventName) => {
        return new Promise((resolve) => {
          eventTarget.addEventListener(eventName, (...args) => resolve(...args))
        })
      }
      if (newSongOnly) {
        this.fileLoaded = false
      }
      if (forceReset) {
        Toast.show({ text: 'Now loading…' })
        this.fileLoaded = false
      }
      const audio = new Audio()
      let folderIndex = 0
      for (const folder of this.files) {
        if (folder.files) {
          let fileIndex = 0
          for (const file of folder.files) {
            let skipFlag = false
            if (newSongOnly && !forceReset) {
              if (file.album && file.artist) {
                skipFlag = true
              }
            }
            if (!skipFlag) {
              const res = await fetch(file.address)
              const arybuf = await res.arrayBuffer()
              const mp3tag = new MP3Tag(arybuf)
              mp3tag.read()
              if (!this.loadSetting || forceReset || newSongOnly) {
                this.files[folderIndex].files[fileIndex].title =
                  mp3tag.tags.title
                if (!this.files[folderIndex].files[fileIndex].title) {
                  this.files[folderIndex].files[fileIndex].title = file.address
                }
                this.files[folderIndex].files[fileIndex].artist =
                  mp3tag.tags.artist
                this.files[folderIndex].files[fileIndex].album =
                  mp3tag.tags.album
              }
              if (!file.duration || forceReset) {
                audio.src = file.address
                audio.load()
                await eventPromisify(audio, 'loadedmetadata')
                this.files[folderIndex].files[fileIndex].duration =
                  audio.duration
              }
              if (mp3tag.tags.v2 && mp3tag.tags.v2.APIC) {
                const fileType = mp3tag.tags.v2.APIC[0].format
                //サムネイルはUnit8Array型式になっているので、Blobに変換する
                const unit8array = new Uint8Array(mp3tag.tags.v2.APIC[0].data)
                const blob = new Blob([unit8array], {
                  type: fileType,
                })
                const blobUrl = URL.createObjectURL(blob)

                this.files[folderIndex].files[fileIndex].thumbnailBlob = blob
                this.files[folderIndex].files[fileIndex].thumbnail = blobUrl
              }
              //最後の曲まで処理が終わったら、通知を更新するためにスタンバイを送る
              if (
                this.files.length - 1 == folderIndex &&
                this.files[folderIndex].files.length - 1 == fileIndex
              ) {
                this.nowPlaying.thumbnail =
                  this.files[this.current.folderIndex].files[
                    this.current.fileIndex
                  ].thumbnail
                this.nowPlaying.thumbnailBlob =
                  this.files[this.current.folderIndex].files[
                    this.current.fileIndex
                  ].thumbnailBlob
                this.play(undefined, undefined, undefined, true)
                this.fileLoaded = true
                if (forceReset) {
                  Toast.show({ text: '再読み込みしました' })
                  this.fileLoaded = true
                  //データをストレージに保存
                  this.saveData()
                }
                if (newSongOnly) {
                  this.fileLoaded = true
                }
              }
            }
            //await this.sleep(1500)
            fileIndex += 1
          }
        }
        folderIndex += 1
      }
    },
    /** ファイルの再読み込み */
    reload() {
      this.tagSearch(true)
    },
    /** ファイル追加ダイアログを表示 */
    async folderPicker() {
      this.folderPickerDialog = true
    },
    /**
     * 指定ディレクトリのファイル一覧を取得
     * @param {string} [path=''] このディレクトリ以下を探す
     */
    async searchDir(path = '') {
      const dir = await Filesystem.readdir({
        directory: Directory.ExternalStorage,
        path: path,
      })
      return dir.files
    },
    /** 指定されたディレクトリ以下の全ファイルをプレイリストに追加 */
    async addPlaylist(path, loopNow = false, addPreinstall = false) {
      if (!loopNow) {
        this.playlistBuffer = []
        this.addPlaylistLoading = true
      }

      if (addPreinstall) {
        for (const music of this.preinstallFiles[0].files) {
          this.playlistBuffer.push(music.address)
        }
      } else {
        const directory = await this.searchDir(path)
        for (const subDirectory of directory) {
          switch (subDirectory.type) {
            case 'file':
              switch (subDirectory.name.slice(-4)) {
                case '.mp3':
                case '.wav':
                  this.playlistBuffer.push(subDirectory.uri)
                  break
                default:
                  break
              }
              break
            case 'directory':
              await this.addPlaylist(`${path}/${subDirectory.name}`, true)
              break
            default:
              break
          }
        }
      }

      if (!loopNow) {
        for (const music of this.playlistBuffer) {
          const decodedMusic = addPreinstall ? music : decodeURIComponent(music)
          const splited = decodedMusic.split('/')
          const address = addPreinstall
            ? music
            : Capacitor.convertFileSrc(decodedMusic)
          let directoryName
          if (addPreinstall) {
            directoryName = 'きのこ鍋 - ときえのき'
          } else {
            directoryName = decodeURIComponent(splited[splited.length - 2])
          }
          let alreadyAdded = false
          const filesBuffer = this.files

          //既にファイルが追加されている場合は、スキップする
          for (const folder of filesBuffer) {
            if (folder.title == directoryName) {
              for (const file of folder.files) {
                if (file.address == address) {
                  alreadyAdded = true
                }
              }
            }
          }
          if (alreadyAdded) {
            continue
          }

          let folderIndex = 0
          let continueFlag = false
          for (const folder of filesBuffer) {
            if (folder.title == directoryName) {
              this.files[folderIndex].files.push({
                address: address,
              })
              continueFlag = true
              continue
            }
            folderIndex += 1
          }
          if (continueFlag) {
            continue
          }
          this.files.push({
            title: directoryName,
            onDisplay: true,
            files: [
              {
                address: address,
              },
            ],
          })
        }
        this.saveData()
        //新規で入れた曲をタグサーチする
        this.tagSearch(false, true)
        Toast.show({ text: `${this.playlistBuffer.length}曲読み込みました` })
        this.addPlaylistLoading = false
        this.folderPickerDialog = false
      }
    },
    /**
     * ファイルの削除
     * @param {string} type 'folder'または'file'
     * @param {number} folderIndex 何番目のフォルダーを消すか？
     * @param {number} fileIndex 何番目のファイルを消すか？
     */
    remove(type, folderIndex, fileIndex) {
      if (type == 'all') {
        this.files = []
      }
      if (type == 'folder') {
        this.files.splice(folderIndex, 1)
      }
      if (type == 'file') {
        this.files[folderIndex].files.splice(fileIndex, 1)
        if (!this.files[folderIndex].files.length) {
          this.files.splice(folderIndex, 1)
        }
      }
      if (!this.files[0]) {
        this.$refs.filesTab.closeEdit()
      }
      this.saveData()
    },
    /** プリインストールの楽曲を追加する */
    addPreinstall() {
      this.addPlaylist(null, false, true)
    },
    /** async/awaitでtimeミリ秒待つ */
    sleep(time) {
      new Promise((resolve) => setTimeout(resolve, time))
    },
  },
  watch: {
    random: function () {
      this.saveData()
    },
    repeat: function () {
      this.saveData()
    },
    tab: function () {
      this.saveData()
    },
  },
  async mounted() {
    //プリインストール楽曲リストを初期化
    this.preinstallFiles = this.files
    //設定を復元
    try {
      const jsonSettings = await this.readFile('settings.json')
      const settings = JSON.parse(jsonSettings.data)
      this.current = settings.current
      this.files = settings.files
      this.nowPlaying = settings.nowPlaying
      this.random = settings.random
      this.repeat = settings.repeat
      this.speed = settings.speed
      this.loadSetting = true
      this.tab = settings.tab
      this.musicDuration = settings.musicDuration
      this.$refs.player.currentTime = settings.currentTime
    } catch (e) {
      console.log(e)
    }

    //タグ検索
    this.tagSearch()

    //終わったら次の曲の再生
    if (this.$refs.player) {
      this.$refs.player.addEventListener('ended', () => this.next(true))
    }

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

    //定期的に設定をストレージに保存
    setInterval(() => {
      this.saveData()
    }, 3000)

    //端末側の楽曲コントロールの命令用
    const th = this
    document.addEventListener('controlsNotification', (event) => {
      let position = 0
      let parsent = 0
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
        case 'music-controls-seek-to':
          position = event.position / 1000
          parsent = (position / th.musicDuration) * 100
          th.move(parsent)
          break
        default:
          break
      }
    })

    setInterval(() => {
      if (this.$refs.player && !this.$refs.player.paused) {
        CapacitorMusicControls.updateElapsed({
          elapsed: this.currentTime * 1000,
          isPlaying: true,
        })
      }
    }, 1000)

    //スタンバイ
    this.play(undefined, undefined, undefined, true)
  },
}
</script>

<style lang="scss">
.wrap-div {
  overflow: hidden;
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
