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
    document.title = 'Vue APK'

    App.addListener('backButton', () => {
      console.log('back!')
      Toast.show({ text: 'Back!' })
      this.$router.back()
    })
  },
}
</script>

<style>
* {
  user-select: none;
}
</style>
