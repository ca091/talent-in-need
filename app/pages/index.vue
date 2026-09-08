<script setup lang="ts">
const {
  state,
  todayKey,
  dayNumber,
  todaysWords,
  todayWordProgress,
  todayNews,
  completion,
  averageFirstListen,
  averageReplay,
} = useLearningState()

const steps = computed(() => [
  {
    number: '01',
    title: '词卡热身',
    description: `复习到期卡片，再认识 ${state.value.newPerDay} 个新词。`,
    meta: `${todayWordProgress.value}/${todaysWords.value.length || state.value.newPerDay} 已完成`,
    to: '/vocab',
    action: '去复习',
    done: todayWordProgress.value > 0,
    icon: 'i-lucide-languages',
  },
  {
    number: '02',
    title: '听读一条新闻',
    description: '先裸听，再看文字，最后再次裸听。',
    meta: '12 MIN · LEVEL 2/3',
    to: '/news',
    action: '记一条',
    done: todayNews.value.length > 0,
    icon: 'i-lucide-headphones',
  },
  {
    number: '03',
    title: '60 秒口头概述',
    description: '说出主题、两个事实和你的看法。',
    meta: '20:00 以后',
    to: '/news',
    action: '去记录',
    done: todayNews.value.some(entry => entry.recap),
    icon: 'i-lucide-mic',
  },
])
</script>

<template>
  <div class="space-y-12">
    <section class="grid min-h-80 items-center gap-10 md:grid-cols-[1fr_18rem]">
      <div>
        <UBadge color="primary" variant="soft" size="sm">
          {{ todayKey }} · DAY {{ dayNumber + 1 }}
        </UBadge>
        <h1 class="mt-5 font-display text-5xl leading-[0.98] tracking-[-0.055em] text-highlighted sm:text-6xl lg:text-7xl">
          今天，先让<br><em class="text-primary">耳朵认出</em>英语。
        </h1>
        <p class="mt-6 max-w-md text-sm leading-7 text-muted">
          阅读是地图，听力才是路。用 30 分钟，把声音和意义接在一起。
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton to="/vocab" trailing-icon="i-lucide-arrow-right" size="lg">开始今日词卡</UButton>
          <UButton to="/news" color="neutral" variant="ghost" size="lg">记录一条新闻</UButton>
        </div>
      </div>

      <UCard class="hidden md:block" :ui="{ body: 'space-y-5 p-7' }">
        <div class="flex items-end justify-between">
          <div>
            <p class="text-xs font-bold tracking-[0.16em] text-muted">TODAY</p>
            <p class="mt-2 font-display text-6xl text-highlighted">{{ completion }}<small class="text-xl text-primary">%</small></p>
          </div>
          <UIcon name="i-lucide-audio-lines" class="size-9 text-primary" />
        </div>
        <UProgress :model-value="completion" size="lg" />
        <p class="text-xs text-muted">声音 → 意义 · 今日完成</p>
      </UCard>
    </section>

    <section>
      <div class="mb-5 flex items-end justify-between gap-4">
        <div>
          <p class="text-[10px] font-bold tracking-[0.16em] text-muted">THE 30-MINUTE LOOP</p>
          <h2 class="mt-2 font-display text-3xl tracking-tight text-highlighted">今天的三段路</h2>
        </div>
        <p class="hidden text-xs text-muted sm:block">完成一段，就点亮一段</p>
      </div>

      <div class="grid gap-3 md:grid-cols-3">
        <UCard v-for="step in steps" :key="step.number" :ui="{ body: 'flex min-h-52 flex-col p-6' }">
          <div class="flex items-center justify-between">
            <span class="font-display text-xl italic text-primary">{{ step.number }}</span>
            <UIcon :name="step.done ? 'i-lucide-circle-check' : step.icon" :class="step.done ? 'text-success' : 'text-muted'" class="size-5" />
          </div>
          <h3 class="mt-5 font-semibold text-highlighted">{{ step.title }}</h3>
          <p class="mt-2 flex-1 text-sm leading-6 text-muted">{{ step.description }}</p>
          <div class="mt-5 flex items-center justify-between gap-3">
            <span class="text-[10px] tracking-wide text-dimmed">{{ step.meta }}</span>
            <UButton :to="step.to" color="primary" variant="link" trailing-icon="i-lucide-arrow-right" size="xs">{{ step.action }}</UButton>
          </div>
        </UCard>
      </div>
    </section>

    <section class="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
      <UCard class="bg-inverted text-inverted" :ui="{ body: 'p-7' }">
        <p class="text-[10px] font-bold tracking-[0.16em] text-primary">A SMALL PROMISE</p>
        <blockquote class="mt-5 font-display text-2xl leading-snug">
          “不要等到听懂了才开口。<br>开口，是听懂的另一条路。”
        </blockquote>
        <p class="mt-5 text-xs opacity-60">— 你的 12 周练习协议</p>
      </UCard>

      <UCard class="bg-primary/10" :ui="{ body: 'p-7' }">
        <p class="text-[10px] font-bold tracking-[0.16em] text-muted">YOUR SIGNAL</p>
        <div class="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div><strong class="font-display text-4xl text-highlighted">{{ averageFirstListen || '—' }}<small class="text-base text-primary">%</small></strong><span class="block text-xs text-muted">第一次裸听</span></div>
          <UIcon name="i-lucide-arrow-right" class="text-primary" />
          <div><strong class="font-display text-4xl text-highlighted">{{ averageReplay || '—' }}<small class="text-base text-primary">%</small></strong><span class="block text-xs text-muted">再次裸听</span></div>
        </div>
        <p class="mt-5 text-xs leading-5 text-muted">{{ averageFirstListen ? '最近记录显示，文本帮助你把声音的入口打开了。' : '记录第一条新闻后，这里会显示你的听力信号。' }}</p>
      </UCard>
    </section>
  </div>
</template>
