<template lang="pug">
  v-container
    v-row.text-center
      v-col(cols="12")
        v-img.my-3(
          :src="require('../assets/logo.svg')"
          contain
          height="200"
        )

      v-col(class="mb-4")
        h1.display-2.font-weight-bold.mb-3 Welcome to the Vuetify 3 Beta

        p.subheading.font-weight-regular For help and collaboration with other Vuetify developers,<br />please join our online
          a(href="https://community.vuetifyjs.com" target="_blank") Discord Community
      v-col.mb-5(cols="12")
        h2.headline.font-weight-bold.mb-5 What's next?

        v-row(justify="center")
          a.subheading.mx-3(
            v-for="(next, i) in whatsNext"
            :key="i"
            :href="next.href"
            target="_blank"
          ) {{ next.text }}

      v-col.mb-5(cols="12")
        h2.headline.font-weight-bold.mb-5 Important Links

        v-row(justify="center")
          a.subheading.mx-3(
            v-for="(link, i) in importantLinks"
            :key="i"
            :href="link.href"
            target="_blank"
          ) {{ link.text }}

      v-col.mb-5(cols="12")
        h2.headline.font-weight-bold.mb-5 Ecosystem

        v-row(justify="center")
          a.subheading.mx-3(
            v-for="(eco, i) in ecosystem"
            :key="i"
            :href="eco.href"
            target="_blank"
          ) {{ eco.text }}
</template>

<script>
export default {
  name: 'HelloWorld',

  data: () => ({
    ecosystem: [
      {
        text: 'vuetify-loader',
        href: 'https://github.com/vuetifyjs/vuetify-loader/tree/next',
      },
      {
        text: 'github',
        href: 'https://github.com/vuetifyjs/vuetify/tree/next',
      },
      {
        text: 'awesome-vuetify',
        href: 'https://github.com/vuetifyjs/awesome-vuetify',
      },
    ],
    importantLinks: [
      {
        text: 'Chat',
        href: 'https://community.vuetifyjs.com',
      },
      {
        text: 'Made with Vuetify',
        href: 'https://madewithvuejs.com/vuetify',
      },
      {
        text: 'Twitter',
        href: 'https://twitter.com/vuetifyjs',
      },
      {
        text: 'Articles',
        href: 'https://medium.com/vuetify',
      },
    ],
    whatsNext: [
      {
        text: 'Explore components',
        href: 'https://vuetifyjs.com',
      },
      {
        text: 'Roadmap',
        href: 'https://vuetifyjs.com/introduction/roadmap/',
      },
      {
        text: 'Frequently Asked Questions',
        href: 'https://vuetifyjs.com/getting-started/frequently-asked-questions',
      },
    ],
  }),
}
</script>
