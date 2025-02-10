<template lang="pug">
.about-tab
  .app-title.ma-2
    p
      img.mx-1(src="/logo.png")
      span Dopamine
  p by jikantoki
  .version
    p Version: {{ packageJson.version }}
  .ma-8
  p.links
    span.links-title Links
    v-icon.icon-text.mx-1 mdi-link-variant
  .links-wrap
    .link(v-for="link of links")
      a(:href="link.url" target="_blank")
        v-btn(:icon="link.icon" size="x-large" variant="text")
  hr.my-2
  p.links
    span.links-title Contact Us
    v-icon.icon-text.mx-1 mdi-human-greeting
  .links-wrap
    .link(v-for="link of myLinks")
      a(:href="link.url" target="_blank")
        v-btn(:icon="link.icon" size="x-large" variant="text")
  p.my-4 &copy;ときえのき
</template>

<script>
import packageJson from '/package.json'

export default {
  data() {
    return {
      packageJson,
      links: [
        {
          icon: 'mdi-github',
          url: 'https://github.com/jikantoki/dopamine',
        },
        {
          icon: 'mdi-earth',
          url: 'https://dopamine.enoki.xyz',
        },
      ],
      myLinks: [
        {
          icon: 'mdi-twitter',
          url: 'https://twitter.com/jikantoki',
        },
        {
          icon: 'mdi-youtube',
          url: 'https://youtube.com/@jikantoki',
        },
        {
          icon: 'mdi-earth',
          url: 'https://enoki.xyz',
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
.about-tab {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .app-title {
    font-size: 2em;
    img {
      height: 1em;
      vertical-align: middle;
    }
  }
  .links {
    font-size: 2em;
  }
  .links-wrap {
    display: flex;
  }
}
a {
  color: unset;
}
.icon-text {
  font-size: 0.8em;
  vertical-align: middle;
}
hr {
  width: 15em;
}
</style>
