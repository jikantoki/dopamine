<template lang="pug">
  .playerTab
    p {{ filename ? filename.address : null }} {{ mini }}
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
    /** 初めから楽曲再生 */
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
