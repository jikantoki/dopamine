<!-- eslint-disable no-irregular-whitespace -->
<template lang="pug">
  .player-tab(:class="mini ? 'mini' : 'notmini'")
    .controls
      .main-screen(v-if="!mini")
        .cover-img
          img(:src='filename && filename.thumbnail && !noFile ? filename.thumbnail : "/thumbnail_default.jpg"')
        .music-info
          p.title {{ calcTitle(filename) }}
          p.artist {{ filename && filename.artist ? filename.artist : '　' }}
          p.album {{ filename && filename.album ? filename.album : '　' }}
          .seek-bar.mt-8.mb-6(
            @click="seekbar"
            @touchstart.stop
            @touchend.stop
            @touchmove.stop="seekbar"
          )
            v-progress-linear.my-2(
              :model-value="(currentTime / duration) * 100"
              height=10
              ref="notMiniProgress"
            )
          .time
            p {{ calcTime(currentTime) }}
            p {{ calcTime(duration) }}
      .cover-img(v-if="mini")
        img(:src='filename && filename.thumbnail ? filename.thumbnail : "/thumbnail_default.jpg"')
      .music-info(v-if="mini")
          p.title {{ calcTitle(filename) }}
          p.artist {{ filename && filename.artist ? filename.artist : '　' }}
      .control-buttons
        .buttons
          .main-buttons
            v-btn.button(
              icon="mdi-skip-previous"
              @click="prev()"
              :size="mini ? 'small' : 'x-large'"
              variant="text"
            )
            v-btn.button(
              icon="mdi-play"
              @click="play()"
              v-show="!status"
              :size="mini ? undefined : 'x-large'"
              variant="outlined"
              style="border-width: 4px"
            )
            v-btn.button(
              icon="mdi-pause"
              @click="pause()"
              v-show="status"
              :size="mini ? undefined : 'x-large'"
              variant="outlined"
              style="border-width: 4px"
            )
            v-btn.button(
              icon="mdi-skip-next"
              @click="next()"
              :size="mini ? 'small' : 'x-large'"
              variant="text"
              )
          .sub-buttons.left
            v-btn.button(
              v-if="!mini"
              icon="mdi-shuffle"
              size="x-large"
              variant="text"
              :style="random ? 'opacity: 1' : 'opacity: 0.5'"
              @click="switchRandom(!random)"
            )
          .sub-buttons.right
            v-btn.button.right(
              v-if="!mini"
              icon="mdi-repeat-once"
              size="x-large"
              variant="text"
              :style="repeat ? 'opacity: 1' : 'opacity: 0.5'"
              @click="switchRepeat(!repeat)"
            )
      .info.py-2(v-if="!mini")
        .speed
          v-btn.py-2(
            variant="text"
            @click="speedDialog = true"
          ) {{ speed.toFixed(2) }}x
        .index
          v-btn.index-button.py-2(
            variant="text"
            @click="$emit('goFile')"
          ) # {{ fileIndex + 1 }} of {{ currentFolder }} >>
    .progress(v-show="mini")
      v-progress-linear(
        :model-value="(currentTime / duration) * 100"
        @click="seekbar"
        @touchstart.stop
        @touchend.stop
        @touchmove.stop="seekbar"
        ref="miniProgress"
      )
  v-dialog(v-model="speedDialog")
    v-card(title="再生速度")
      VNumberInput(
        controlVariant="split"
        label="スピードを入力"
        v-model="speedInput"
        :max="4"
        :min="0.1"
        :step="0.05"
      )
      v-card-actions
        v-btn(@click="speedDialog = false") 決定
</template>

<script>
import { Toast } from '@capacitor/toast'
import { VNumberInput } from 'vuetify/labs/VNumberInput'

export default {
  components: {
    VNumberInput,
  },
  props: {
    filename: {
      type: String,
    },
    /** 再生中フラグBoolean */
    status: {
      type: Boolean,
    },
    /** 小さい再生バーの表示 */
    mini: {
      type: Boolean,
      default: false,
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
    /** 今再生しているファイルのフォルダー名 */
    currentFolder: {
      type: String,
      default: '',
    },
    /** 今再生しているのはフォルダー内で何番目の曲か */
    fileIndex: {
      type: Number,
      default: 0,
    },
    /** 再生速度 */
    speed: {
      type: Number,
      default: 1,
    },
    /** リピートするか？ */
    repeat: {
      type: Boolean,
      default: false,
    },
    /** ランダム再生するか？ */
    random: {
      type: Boolean,
      default: false,
    },
    /** ファイルが存在しないフラグ */
    noFile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /** 最初の一回だけトーストを表示する用 */
      toastOnce: false,
      /** スピード調整ダイアログ表示用 */
      speedDialog: false,
      /** 内部入力用の再生速度 */
      speedInput: 1,
    }
  },
  methods: {
    /** 良い感じのタイトルを付ける */
    calcTitle(filename) {
      if (filename) {
        if (filename.title && filename.title != '') {
          return filename.title
        } else {
          const splited = filename.address.split('/')
          return splited[splited.length - 1]
        }
      } else {
        return null
      }
    },
    /** 楽曲再生 */
    play() {
      this.$emit('play')
    },
    /** 一時停止 */
    pause() {
      this.$emit('pause')
    },
    /** 戻る */
    prev() {
      this.$emit('prev')
    },
    /** 進む */
    next() {
      this.$emit('next')
    },
    /** ランダム再生をオン/オフ */
    switchRandom(bool) {
      this.$emit('random', bool)
    },
    /** リピート再生をオン/オフ */
    switchRepeat(bool) {
      this.$emit('repeat', bool)
    },
    /** 再生位置の変更 */
    seekbar(event) {
      if (!this.duration) {
        //これをしないと1秒に数十回リクエストが来る
        if (!this.toastOnce) {
          this.toastOnce = true
          console.log('0秒の曲でシークバーの移動はできません')
          Toast.show({ text: 'エラー: リトライしてください' })
          setTimeout((this.toastOnce = false), 5000)
        }
        return
      }
      /** 現在の再生位置（px） */
      let currentX
      if (event.layerX) {
        currentX = event.layerX
      } else {
        /** event.target要素の左上のX座標 */
        const DOMleft = event.target.getBoundingClientRect().left
        currentX = event.touches[0].pageX - DOMleft
      }
      /** シークバー全体の幅（px） */
      const clientWidth = event.target.clientWidth
      this.$emit('move', (currentX / clientWidth) * 100)
    },
    /** 秒（Number）を分:秒（String）に変換 */
    calcTime(sec) {
      const calcedSec = Math.floor(sec % 60)
      const min = Math.floor((sec % 3600) / 60)
      return `${String(min).padStart(2, 0)}:${String(calcedSec).padStart(2, 0)}`
    },
  },
  watch: {
    speed: function (newSpeed) {
      //index側で再生速度が変わっていたら、同期する
      this.speedInput = newSpeed
    },
    speedInput: function (newSpeed) {
      //再生速度を入力したら、即時反映させる
      this.$emit('speedChange', newSpeed)
    },
  },
}
</script>

<style lang="scss" scoped>
img {
  width: 10em;
}
.player-tab.notmini {
  height: 100%;
  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
    .main-screen {
      width: 100%;
      margin: 5em 0;
      .music-info {
        margin: 1em 3em;
        white-space: nowrap;
        overflow: hidden;
        .title {
          font-size: 1.5em;
        }
        .time {
          display: flex;
          justify-content: space-between;
        }
      }
      .cover-img {
        img {
          width: 90%;
          max-width: 25em;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 5%;
        }
      }
    }
    .info {
      width: 100%;
      background: rgb(var(--v-theme-surface-light));
      position: relative;
      height: 3em;
      .speed,
      .index {
        position: absolute;
        top: 50%;
        transform: translate(0%, -50%);
      }
      .speed {
        left: 0.2em;
      }
      .index {
        right: 0.2em;
        .index-button {
          max-width: 80vw;
          overflow: hidden;
        }
      }
    }
  }
  .control-buttons {
    flex: 1;
    position: relative;
    width: 100%;
    .buttons {
      .main-buttons {
        position: absolute;
        bottom: 0;
        width: 100%;
        background: rgb(var(--v-theme-surface-light));
        padding: 1em;
        white-space: nowrap;
        .button {
          margin: 0 0.2em;
        }
      }
      .sub-buttons {
        position: absolute;
        padding: 1em;
        bottom: 0;
      }
      .left {
        left: 0;
      }
      .right {
        right: 0;
      }
    }
  }
}
.player-tab.mini {
  .controls {
    display: flex;
    background: rgb(var(--v-theme-surface-light));
    .cover-img > img {
      aspect-ratio: 1;
      object-fit: cover;
      width: 4em;
      vertical-align: middle;
      margin: 4px;
      border-radius: 10%;
    }
    .music-info {
      width: -webkit-fill-available;
      white-space: nowrap;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .title {
        font-size: 1.5em;
      }
    }
    .control-buttons {
      .buttons {
        display: flex;
        height: 100%;
        .main-buttons {
          margin: auto;
          display: flex;
          align-items: center;
          .button {
            margin: 0 0.2em;
          }
        }
      }
    }
  }
}
</style>
