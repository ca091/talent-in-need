<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: `${runtimeConfig.app.baseURL}favicon.ico`,
    },
  ],
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
