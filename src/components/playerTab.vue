<template lang="pug">
  .player-tab(:class="mini ? 'mini' : 'notmini'")
    .main-screen(v-if="!mini")
      .cover-img
        img(:src='filename && filename.thumbnail ? filename.thumbnail : "/thumbnail_default.jpg"')
      .music-info
        p.title {{ filename ? filename.title ? filename.title : filename.address : null }}
        p.artist {{ filename && filename.artist ? filename.artist : null }}
        p.album {{ filename && filename.album ? filename.album : null }}
    .cover-img(v-if="mini")
      img(:src='filename && filename.thumbnail ? filename.thumbnail : "/thumbnail_default.jpg"')
    .music-info(v-if="mini")
        p.title {{ filename ? filename.title ? filename.title : filename.address : null }}
        p.artist {{ filename && filename.artist ? filename.artist : null }}
    .control-buttons
      .buttons
        v-btn.button(icon="mdi-skip-previous" @click="prev()")
        v-btn.button(icon="mdi-play" @click="play()" v-show="!status")
        v-btn.button(icon="mdi-pause" @click="pause()" v-show="status")
        v-btn.button(icon="mdi-skip-next" @click="next()")
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
  },
  mounted() {},
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
  },
}
</script>

<style lang="scss" scoped>
img {
  width: 10em;
}
.player-tab.notmini {
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
    }
    .cover-img {
      img {
        width: 95%;
        max-width: 25em;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 10%;
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
      background: gray;
      padding: 1em;
      .button {
        margin: 0 1em;
      }
    }
  }
}
.player-tab.mini {
  display: flex;
  background: gray;
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
  }
  .control-buttons {
    display: flex;
    .buttons {
      margin: auto;
      display: flex;
      .button {
        margin: 0 0.2em;
      }
    }
  }
}
</style>
