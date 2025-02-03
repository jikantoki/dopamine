<template lang="pug">
  .player-tab(:class="mini ? 'mini' : 'notmini'")
    .main-screen(v-if="!mini")
      .cover-img
        img(:src='filename && filename.thumbnail ? filename.thumbnail : "/thumbnail_default.jpg"')
      .title
        p {{ filename ? filename.title ? filename.title : filename.address : null }}
    .cover-img(v-if="mini")
      img(:src='filename && filename.thumbnail ? filename.thumbnail : "/thumbnail_default.jpg"')
    .title(v-if="mini")
        p {{ filename ? filename.title ? filename.title : filename.address : null }}
    .control-buttons
      .buttons
        v-btn(icon="mdi-skip-previous" @click="prev()")
        v-btn(icon="mdi-play" @click="play()" v-show="!status")
        v-btn(icon="mdi-pause" @click="pause()" v-show="status")
        v-btn(icon="mdi-skip-next" @click="next()")
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
    .cover-img {
      img {
        width: 80%;
        max-width: 25em;
        aspect-ratio: 1;
        object-fit: cover;
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
    }
  }
}
.player-tab.mini {
  display: flex;
  .cover-img > img {
    aspect-ratio: 1;
    object-fit: cover;
    width: 4em;
  }
  .title {
    width: -webkit-fill-available;
  }
  .control-buttons > .buttons {
    display: flex;
  }
}
</style>
