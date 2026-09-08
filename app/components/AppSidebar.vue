<script setup lang="ts">
const route = useRoute()
const { averageReplay } = useLearningState()

const items = [
  { label: '今日计划', caption: '30 min', to: '/', icon: 'i-lucide-sun' },
  { label: '词汇工作台', caption: 'Anki', to: '/vocab', icon: 'i-lucide-languages' },
  { label: '听读记录', caption: '输入', to: '/news', icon: 'i-lucide-headphones' },
  { label: 'Anki 入门', caption: '一步步', to: '/guide', icon: 'i-lucide-graduation-cap' },
]
</script>

<template>
  <aside class="border-b border-default lg:min-h-[calc(100vh-4.5rem)] lg:border-e lg:border-b-0">
    <div class="flex gap-2 overflow-x-auto p-3 lg:sticky lg:top-18 lg:flex-col lg:p-8 lg:ps-12">
      <p class="mb-3 hidden text-[10px] font-bold tracking-[0.16em] text-muted lg:block">YOUR ROUTE</p>
      <UButton
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :icon="item.icon"
        :color="route.path === item.to ? 'primary' : 'neutral'"
        :variant="route.path === item.to ? 'soft' : 'ghost'"
        class="shrink-0 justify-start lg:w-full"
      >
        <span>{{ item.label }}</span>
        <span class="hidden text-[10px] opacity-60 lg:ms-auto lg:inline">{{ item.caption }}</span>
      </UButton>

      <div class="mt-8 hidden border-t border-muted pt-6 lg:block">
        <p class="text-[10px] font-bold tracking-[0.16em] text-muted">本周听力信号</p>
        <p class="mt-3 font-display text-4xl">{{ averageReplay || '—' }}<small class="text-base text-primary">%</small></p>
        <UProgress :model-value="averageReplay" color="primary" size="sm" class="mt-3" />
        <p class="mt-2 text-xs text-muted">再次裸听理解率</p>
      </div>
    </div>
  </aside>
</template>
