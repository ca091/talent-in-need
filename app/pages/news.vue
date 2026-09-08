<script setup lang="ts">
const { state, recentEntries, saveNews } = useLearningState()

const levels = ['Level 2', 'Level 3', '影视 / 对话', '其他']
const saved = ref(false)
const form = reactive({
  title: '',
  url: '',
  level: 'Level 2',
  date: new Date().toISOString().slice(0, 10),
  firstListen: 10,
  afterText: 70,
  replay: 80,
  vocabulary: '',
  recap: false,
  note: '',
})

function submit() {
  if (!form.title.trim()) return
  saveNews({
    ...form,
    title: form.title.trim(),
    vocabulary: form.vocabulary.trim(),
    note: form.note.trim(),
  })
  form.title = ''
  form.url = ''
  form.vocabulary = ''
  form.note = ''
  form.recap = false
  saved.value = true
}
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <UBadge color="primary" variant="soft">LISTENING LOG</UBadge>
        <h1 class="mt-5 font-display text-5xl leading-none tracking-[-0.05em] text-highlighted sm:text-6xl">让每一次<br><em class="text-primary">听不懂</em>留下线索。</h1>
      </div>
      <p class="text-sm leading-6 text-muted">先裸听，不要暂停。<br>记录比感觉可靠。</p>
    </header>

    <UAlert v-if="saved" color="success" variant="soft" icon="i-lucide-circle-check" title="已保存这次听读" />

    <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <UCard :ui="{ body: 'p-6' }">
        <form class="space-y-7" @submit.prevent="submit">
          <section class="space-y-4">
            <p class="text-[10px] font-bold tracking-[0.16em] text-primary">01 · 材料</p>
            <UFormField label="标题" required>
              <UInput v-model="form.title" placeholder="例如：Messi retires" class="w-full" />
            </UFormField>
            <UFormField label="原文 URL">
              <UInput v-model="form.url" type="url" icon="i-lucide-link" placeholder="https://…" class="w-full" />
            </UFormField>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="级别">
                <USelect v-model="form.level" :items="levels" class="w-full" />
              </UFormField>
              <UFormField label="日期">
                <UInput v-model="form.date" type="date" class="w-full" />
              </UFormField>
            </div>
          </section>

          <USeparator />

          <section class="space-y-5">
            <p class="text-[10px] font-bold tracking-[0.16em] text-primary">02 · 三次听力</p>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-muted">第一次裸听</span><strong class="text-primary">{{ form.firstListen }}%</strong></div>
              <USlider v-model="form.firstListen" :min="0" :max="100" />
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-muted">看文本后</span><strong class="text-primary">{{ form.afterText }}%</strong></div>
              <USlider v-model="form.afterText" :min="0" :max="100" />
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm"><span class="text-muted">再次裸听</span><strong class="text-primary">{{ form.replay }}%</strong></div>
              <USlider v-model="form.replay" :min="0" :max="100" />
            </div>
          </section>

          <USeparator />

          <section class="space-y-4">
            <p class="text-[10px] font-bold tracking-[0.16em] text-primary">03 · 输出</p>
            <UFormField label="查阅词汇">
              <UTextarea v-model="form.vocabulary" :rows="2" placeholder="retirement, emotional…" class="w-full" />
            </UFormField>
            <UFormField label="一句话自评">
              <UTextarea v-model="form.note" :rows="2" placeholder="这次最卡的是连读 / 生词 / 语速…" class="w-full" />
            </UFormField>
            <UCheckbox v-model="form.recap" label="我在 20:00 后完成了 60 秒口头概述" />
          </section>

          <UButton type="submit" block size="lg" trailing-icon="i-lucide-arrow-right">保存这次听读</UButton>
        </form>
      </UCard>

      <div class="space-y-7">
        <UCard class="bg-inverted text-inverted" :ui="{ body: 'p-7' }">
          <p class="text-[10px] font-bold tracking-[0.16em] text-primary">THE RULE</p>
          <h2 class="mt-4 font-display text-3xl leading-none">听三次，<br>每次有不同任务。</h2>
          <div class="mt-7 divide-y divide-inverted/20">
            <div
              v-for="(rule, index) in [
              ['裸听', '只抓主题和人物，不追每个词。'],
              ['看文本', '标出声音和文字没有对上的地方。'],
              ['再裸听', '验证意义有没有留在耳朵里。'],
              ]"
              :key="rule[0]"
              class="grid grid-cols-[2rem_1fr] gap-3 py-4 text-sm"
            >
              <span class="font-display text-xl text-primary">{{ index + 1 }}</span>
              <p class="opacity-70"><strong class="block text-inverted">{{ rule[0] }}</strong>{{ rule[1] }}</p>
            </div>
          </div>
        </UCard>

        <section>
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-display text-2xl text-highlighted">最近记录</h2>
            <UBadge color="neutral" variant="soft">{{ state.newsEntries.length }} 条</UBadge>
          </div>
          <UCard v-if="!recentEntries.length" variant="subtle">
            <p class="text-sm leading-6 text-muted">还没有记录。今晚听完第一条新闻，就从这里开始。</p>
          </UCard>
          <div v-else class="divide-y divide-muted border-y border-muted">
            <article v-for="entry in recentEntries" :key="entry.id" class="flex items-center justify-between gap-4 py-4">
              <div class="min-w-0">
                <p class="text-xs text-muted">{{ entry.date }} · {{ entry.level }}</p>
                <p class="mt-1 truncate font-display text-lg text-highlighted">{{ entry.title }}</p>
              </div>
              <UBadge :color="entry.replay >= 70 ? 'success' : 'warning'" variant="soft">{{ entry.replay }}%</UBadge>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
