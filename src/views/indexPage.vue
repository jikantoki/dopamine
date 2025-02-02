<template lang="pug">
  v-main
    HelloWorld
  router-link(to='/sub')
    v-btn Go to sub page
</template>

<script>
import HelloWorld from '/src/components/HelloWorld.vue'

export default {
  components: {
    HelloWorld,
  },
}
</script>
