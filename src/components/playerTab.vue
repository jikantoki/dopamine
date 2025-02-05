<template lang="pug">
  .player-tab(:class="mini ? 'mini' : 'notmini'")
    .controls
      .main-screen(v-if="!mini")
        .cover-img
          img(:src='filename && filename.thumbnail ? filename.thumbnail : "/thumbnail_default.jpg"')
        .music-info
          p.title {{ filename ? filename.title ? filename.title : filename.address : null }}
          p.artist {{ filename && filename.artist ? filename.artist : null }}
          p.album {{ filename && filename.album ? filename.album : null }}
          .seek-bar.mt-12.mb-6(@click="seekbar")
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
          p.title {{ filename ? filename.title ? filename.title : filename.address : null }}
          p.artist {{ filename && filename.artist ? filename.artist : null }}
      .control-buttons
        .buttons
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
    .progress(v-show="mini")
      v-progress-linear(
        :model-value="(currentTime / duration) * 100"
        @click="seekbar"
        ref="miniProgress"
      )
</template>

<script>
export default {
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
  },
  methods: {
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
    seekbar(event) {
      /** 現在の再生位置（px） */
      const currentX = event.layerX
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
      margin: 6em 0;
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
          border-radius: 10%;
        }
      }
    }
  }
  .control-buttons {
    flex: 1;
    position: relative;
    width: 100%;
    .buttons {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: rgb(var(--v-theme-surface-light));
      padding: 1em;
      align-items: center;
      .button {
        margin: 0 1em;
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
      .title {
        font-size: 1.5em;
      }
    }
    .control-buttons {
      display: flex;
      .buttons {
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
</style>
