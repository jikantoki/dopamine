<template lang="pug">
  v-app
    router-view
</template>

<script>
import { App } from '@capacitor/app'
export default {
  name: 'App',

  data: () => ({
    //
  }),

  mounted() {
    document.title = 'Dopamine'

    App.addListener('backButton', () => {
      const now = location.pathname
      if (now != '/') {
        this.$router.back()
      } else {
        App.minimizeApp()
      }
    })
  },
}
</script>

<style>
* {
  user-select: none;
}
</style>
