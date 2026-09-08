<script setup lang="ts">
const { exportBackup } = useLearningState()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default bg-default/85 backdrop-blur-xl">
    <div class="mx-auto flex h-18 max-w-360 items-center px-5 sm:px-8 lg:px-12">
      <NuxtLink to="/" class="flex items-center gap-3">
        <span class="flex size-8 items-end justify-center gap-0.5 rounded-full bg-primary p-1.5 text-inverted">
          <i class="h-2 w-0.75 rounded-full bg-current" />
          <i class="h-4 w-0.75 rounded-full bg-current" />
          <i class="h-3 w-0.75 rounded-full bg-current" />
          <i class="h-5 w-0.75 rounded-full bg-current" />
        </span>
        <span>
          <strong class="block font-display text-lg leading-none tracking-tight text-highlighted">Listening Desk</strong>
          <small class="mt-1 block text-[10px] tracking-[0.16em] text-muted">耳朵先行</small>
        </span>
      </NuxtLink>

      <p class="ms-auto hidden text-xs text-muted sm:block">A2 → 更自在地听懂日常英语</p>
      <UButton
        class="ms-3"
        icon="i-lucide-download"
        color="neutral"
        variant="ghost"
        aria-label="导出本机备份"
        @click="exportBackup"
      />
    </div>
  </header>
</template>
