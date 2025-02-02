<template lang="pug">
  p {{ filename }}
  audio(controls :src="filename" ref="player")
</template>

<script>
export default {
  props: {
    filename: {
      type: String,
    },
  },
  methods: {
    /** 初めから楽曲再生 */
    play() {
      //何故かsetTimeoutを挟まないと動かない
      const th = this
      setTimeout(function () {
        th.$refs.player.play()
      }, 10)
    },
  },
}
</script>
