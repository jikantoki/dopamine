import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { loadFonts } from './plugins/webfontloader'
import { defineCustomElements } from '@ionic/pwa-elements/loader'

loadFonts()
defineCustomElements(window)

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.mount('#app')
