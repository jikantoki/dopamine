<template lang="pug">
  v-app
    router-view
</template>

<script>
import { App } from '@capacitor/app'
import { Toast } from '@capacitor/toast'
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
        Toast.show({ text: '消させないよ' })
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
