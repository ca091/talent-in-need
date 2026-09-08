<script setup lang="ts">
const {
  state,
  curriculumWords,
  todaysWords,
  todayDone,
  markWord,
  loadDemo,
  importDictionary,
  exportAnki,
} = useLearningState()

const fileInput = ref<HTMLInputElement>()
const showAllWords = ref(false)
const message = ref('')
const error = ref('')
const newWordOptions = [5, 8, 10]
const releaseOptions = computed(() => [50, 100, 200, state.value.words.length].filter((value, index, values) => value > 0 && values.indexOf(value) === index))
const visibleWords = computed(() => showAllWords.value ? curriculumWords.value : todaysWords.value)

function showDemo() {
  loadDemo()
  error.value = ''
  message.value = '已载入 8 个演示词。你可以先体验完整流程，再导入真实词书。'
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  message.value = ''
  try {
    const count = await importDictionary(file)
    message.value = `已导入 ${count.toLocaleString()} 个词条，先释放 ${state.value.releasedCount} 个。`
  } catch (reason: unknown) {
    error.value = reason instanceof Error ? reason.message : '文件读取失败，请确认是词书 ZIP、JSON 或 NDJSON。'
  } finally {
    input.value = ''
  }
}

function handleExport() {
  const count = exportAnki()
  error.value = ''
  message.value = `已生成 ${count} 张 Anki 卡片。`
}
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <div>
        <UBadge color="primary" variant="soft">VOCABULARY WORKBENCH</UBadge>
        <h1 class="mt-5 font-display text-5xl leading-none tracking-[-0.05em] sm:text-6xl">词汇，不是终点。<br><em class="text-primary">是听力的扶手。</em></h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <input ref="fileInput" class="hidden" type="file" accept=".zip,.json,.ndjson,.txt" @change="handleImport">
        <UButton color="neutral" variant="outline" icon="i-lucide-upload" @click="fileInput?.click()">导入词书</UButton>
        <UButton color="neutral" variant="soft" icon="i-lucide-sparkles" @click="showDemo">先看演示</UButton>
      </div>
    </header>

    <UAlert v-if="message" color="success" variant="soft" icon="i-lucide-circle-check" title="操作成功" :description="message" />
    <UAlert v-if="error" color="error" variant="soft" icon="i-lucide-circle-alert" title="无法处理文件" :description="error" />

    <UCard v-if="!state.words.length" variant="subtle" :ui="{ body: 'flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center' }">
      <span class="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10"><UIcon name="i-lucide-file-plus-2" class="size-6 text-primary" /></span>
      <div class="flex-1">
        <h2 class="font-display text-2xl">把 kajweb/dict 的词书导进来</h2>
        <p class="mt-2 leading-6 text-muted">支持 ZIP、JSON、NDJSON。应用会逐行解析、按词形去重，并先释放 100 个词。</p>
      </div>
      <UButton icon="i-lucide-folder-open" @click="fileInput?.click()">选择文件</UButton>
    </UCard>

    <template v-else>
      <UCard class="bg-inverted text-inverted" :ui="{ body: 'flex flex-col gap-5 p-5 lg:flex-row lg:items-center' }">
        <div class="flex-1">
          <p class="text-[10px] font-bold tracking-[0.16em] opacity-60">当前词书</p>
          <p class="mt-1 font-display text-2xl">{{ state.words[0]?.bookId || 'Imported dictionary' }}</p>
          <p class="mt-1 text-xs opacity-60">{{ state.words.length.toLocaleString() }} 个词条 · 已释放 {{ state.releasedCount }}</p>
        </div>
        <div class="flex flex-wrap items-end gap-3">
          <UFormField label="每日新词" size="sm">
            <USelect v-model="state.newPerDay" :items="newWordOptions" class="w-24" />
          </UFormField>
          <UFormField label="释放数量" size="sm">
            <USelect v-model="state.releasedCount" :items="releaseOptions" class="w-28" />
          </UFormField>
          <UButton icon="i-lucide-download" @click="handleExport">导出 Anki TSV</UButton>
        </div>
      </UCard>

      <div class="space-y-2">
        <UCard v-for="word in visibleWords" :key="word.id" :class="todayDone.includes(word.id) ? 'ring-1 ring-success/40' : ''" :ui="{ body: 'grid items-center gap-4 p-4 sm:grid-cols-[auto_1fr_1.2fr] lg:grid-cols-[auto_0.8fr_1fr_1.5fr]' }">
          <UButton
            :icon="todayDone.includes(word.id) ? 'i-lucide-check' : 'i-lucide-circle'"
            :color="todayDone.includes(word.id) ? 'success' : 'neutral'"
            :variant="todayDone.includes(word.id) ? 'soft' : 'ghost'"
            size="sm"
            :aria-label="`${todayDone.includes(word.id) ? '取消完成' : '标记完成'} ${word.word}`"
            @click="markWord(word)"
          />
          <div><p class="font-display text-xl">{{ word.word }}</p><p class="mt-1 text-xs text-primary">{{ word.phonetic || '—' }}</p></div>
          <p class="leading-6">{{ word.meaning }}</p>
          <div class="sm:col-start-2 sm:col-end-4 lg:col-auto"><p class="leading-6 text-toned">{{ word.example || '导入数据没有例句' }}</p><p class="mt-1 text-xs text-muted">{{ word.exampleCn }}</p></div>
        </UCard>
      </div>

      <UButton color="primary" variant="link" :trailing-icon="showAllWords ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" @click="showAllWords = !showAllWords">
        {{ showAllWords ? '只看今日词卡' : `查看已释放的 ${curriculumWords.length} 个词` }}
      </UButton>

      <UAlert color="info" variant="subtle" icon="i-lucide-info" title="导出后会发生什么？" description="TSV 文件导入 Anki；Anki 负责间隔复习，卡片模板负责发音。这个工作台只负责挑词和记录学习。" />
    </template>
  </div>
</template>
