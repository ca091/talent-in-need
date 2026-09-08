<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { StoredWordbook, Word } from '~/composables/useWordbook'

const PAGE_SIZE = 50
const route = useRoute()
const { exportAnki, getWordbook } = useWordbook()
const toast = useToast()
const wordbook = shallowRef<StoredWordbook | null>(null)
const status = ref<'loading' | 'ready' | 'missing' | 'error'>('loading')
const error = ref('')
const page = ref(1)
const showAnkiSetup = ref(false)
const speakingTarget = ref<string | null>(null)
let activeUtterance: SpeechSynthesisUtterance | null = null

const frontTemplate = `<div>{{Word}}</div>`
const backTemplate = `<div id="wordbook-card">
{{FrontSide}}

<hr id="answer">

<div>{{Phonetic}}</div>
<div>{{Meaning}}</div>

{{tts en_US:Word}}

{{#Example}}
<div>{{Example}}</div>
{{tts en_US:Example}}
{{/Example}}

{{#ExampleCN}}
<div>{{ExampleCN}}</div>
{{/ExampleCN}}
</div>

<script>
(() => {
  const card = document.getElementById('wordbook-card')
  if (!card || !('speechSynthesis' in window)) return

  const marker = /\\[anki:tts([^\\]]*)\\]([\\s\\S]*?)\\[\\/anki:tts\\]/g
  if (!marker.test(card.innerHTML)) return
  marker.lastIndex = 0
  card.innerHTML = card.innerHTML.replace(marker, (_, attributes, text) => {
    const match = attributes.match(/\\blang=([^\\s\\]]+)/)
    const language = (match ? match[1] : 'en_US').replace('_', '-')
    const content = encodeURIComponent(text.replace(/<[^>]*>/g, '').trim())
    return '<button type="button" data-wordbook-tts="' + content + '" data-language="' + language + '" aria-label="Read aloud">🔊</button>'
  })

  card.querySelectorAll('[data-wordbook-tts]').forEach((button) => {
    button.addEventListener('click', () => {
      const utterance = new SpeechSynthesisUtterance(decodeURIComponent(button.dataset.wordbookTts || ''))
      utterance.lang = button.dataset.language || 'en-US'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    })
  })
})()
<${'/script'}>`

const columns: TableColumn<Word>[] = [
  { accessorKey: 'rank', header: '#' },
  { accessorKey: 'word', header: '单词' },
  { accessorKey: 'phonetic', header: '音标' },
  { accessorKey: 'meaning', header: '释义' },
  {
    accessorKey: 'example',
    header: '例句',
    meta: { class: { th: 'hidden lg:table-cell', td: 'hidden lg:table-cell' } },
  },
  { id: 'speech', header: '朗读' },
]

const pageWords = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return wordbook.value?.words.slice(start, start + PAGE_SIZE) || []
})

const rangeLabel = computed(() => {
  if (!wordbook.value) return ''
  const start = (page.value - 1) * PAGE_SIZE + 1
  const end = Math.min(page.value * PAGE_SIZE, wordbook.value.words.length)
  return `${start}–${end} / ${wordbook.value.words.length.toLocaleString()}`
})

async function loadWordbook() {
  status.value = 'loading'
  error.value = ''

  try {
    const storageId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    wordbook.value = storageId ? await getWordbook(storageId) : null
    status.value = wordbook.value ? 'ready' : 'missing'
  } catch (reason: unknown) {
    status.value = 'error'
    error.value = reason instanceof Error ? reason.message : '无法读取已保存的词书。'
  }
}

function downloadAnki() {
  if (!wordbook.value) return
  exportAnki(wordbook.value)
  toast.add({
    title: 'Anki 文件已导出',
    description: `${wordbook.value.words.length.toLocaleString()} 个词条`,
    icon: 'i-lucide-download',
  })
}

async function copyTemplate(name: string, template: string) {
  try {
    await navigator.clipboard.writeText(template)
    toast.add({
      title: `${name}已复制`,
      icon: 'i-lucide-copy-check',
    })
  } catch {
    toast.add({
      title: '复制失败，请手动选择模板内容',
      color: 'warning',
      icon: 'i-lucide-copy-x',
    })
  }
}

function stopSpeaking() {
  if (!import.meta.client || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  activeUtterance = null
  speakingTarget.value = null
}

function speak(text: string, target: string) {
  if (!import.meta.client || !('speechSynthesis' in window)) {
    toast.add({
      title: '当前浏览器不支持朗读',
      color: 'warning',
      icon: 'i-lucide-volume-x',
    })
    return
  }

  if (speakingTarget.value === target) {
    stopSpeaking()
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  const clearActiveWord = () => {
    if (activeUtterance !== utterance) return
    activeUtterance = null
    speakingTarget.value = null
  }
  utterance.onend = clearActiveWord
  utterance.onerror = clearActiveWord
  activeUtterance = utterance
  speakingTarget.value = target
  window.speechSynthesis.speak(utterance)
}

onMounted(loadWordbook)
onBeforeUnmount(stopSpeaking)
</script>

<template>
  <main class="min-h-screen py-10 sm:py-16">
    <UContainer class="space-y-8">
      <UButton to="/" color="neutral" variant="link" icon="i-lucide-arrow-left" class="px-0">
        返回导入页
      </UButton>

      <template v-if="status === 'loading'">
        <USkeleton class="h-12 w-64" />
        <USkeleton class="h-96 w-full" />
      </template>

      <UAlert
        v-else-if="status === 'missing'"
        color="warning"
        variant="soft"
        icon="i-lucide-book-x"
        title="找不到这本词书"
        description="它可能已被浏览器清理，或这个地址来自其他设备。请返回首页重新导入。"
      />

      <UAlert
        v-else-if="status === 'error'"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="读取失败"
        :description="error"
      />

      <template v-else-if="wordbook">
        <header class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <UBadge color="primary" variant="soft">WORD BOOK</UBadge>
            <h1 class="mt-4 font-display text-4xl tracking-tight sm:text-5xl">{{ wordbook.id }}</h1>
            <p class="mt-3 text-muted">{{ wordbook.words.length.toLocaleString() }} 个去重词条</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-volume-2"
              @click="showAnkiSetup = !showAnkiSetup"
            >
              Anki 朗读设置
            </UButton>
            <UButton icon="i-lucide-download" size="lg" @click="downloadAnki">
              导出全部 {{ wordbook.words.length.toLocaleString() }} 词
            </UButton>
          </div>
        </header>

        <UCard v-if="showAnkiSetup">
          <template #header>
            <div>
              <h2 class="font-display text-2xl">首次配置 Anki 原生 TTS</h2>
              <p class="mt-2 text-muted">TSV 只能导入数据，不能创建或修改卡片模板。下面的设置只需完成一次。</p>
            </div>
          </template>

          <ol class="list-decimal space-y-2 ps-5">
            <li>在 Mac 版 Anki 打开“工具 → 管理笔记类型”，新增名为 <code>Wordbook TTS</code> 的笔记类型。</li>
            <li>按顺序建立五个字段：<code>Word</code>、<code>Phonetic</code>、<code>Meaning</code>、<code>Example</code>、<code>ExampleCN</code>。</li>
            <li>打开“卡片”，分别替换正面和背面模板；然后再导入本站生成的 TSV。</li>
            <li>已经导入的卡片，可在浏览器中选中后使用“笔记 → 更改笔记类型”，改成 <code>Wordbook TTS</code>。</li>
          </ol>

          <div class="mt-6 grid gap-4 lg:grid-cols-2">
            <section class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <h3>正面模板</h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-copy"
                  @click="copyTemplate('正面模板', frontTemplate)"
                >
                  复制
                </UButton>
              </div>
              <pre class="overflow-x-auto rounded-md bg-elevated p-4"><code>{{ frontTemplate }}</code></pre>
            </section>

            <section class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <h3>背面模板</h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-copy"
                  @click="copyTemplate('背面模板', backTemplate)"
                >
                  复制
                </UButton>
              </div>
              <pre class="max-h-80 overflow-auto rounded-md bg-elevated p-4"><code>{{ backTemplate }}</code></pre>
            </section>
          </div>

          <template #footer>
            <div class="space-y-2 text-muted">
              <p>Mac 版 Anki 翻面后会通过官方 TTS 依次朗读单词和英文例句。</p>
              <p>免费版 AnkiWeb 不原生支持 TTS；模板包含浏览器语音兜底，在 iPhone 上需要点击生成的扬声器按钮播放。</p>
            </div>
          </template>
        </UCard>

        <UCard :ui="{ body: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between' }">
          <p>完整词表</p>
          <p class="text-muted">当前显示 {{ rangeLabel }}</p>
        </UCard>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <div class="overflow-x-auto">
            <UTable :data="pageWords" :columns="columns" class="min-w-180">
              <template #word-cell="{ row }">
                <span class="font-semibold">{{ row.original.word }}</span>
              </template>
              <template #phonetic-cell="{ row }">
                <span class="text-primary">{{ row.original.phonetic || '—' }}</span>
              </template>
              <template #example-cell="{ row }">
                <div class="max-w-md whitespace-normal">
                  <p>{{ row.original.example || '—' }}</p>
                  <p v-if="row.original.exampleCn" class="mt-1 text-muted">{{ row.original.exampleCn }}</p>
                </div>
              </template>
              <template #speech-cell="{ row }">
                <div class="flex items-center gap-1">
                  <UButton
                    :icon="speakingTarget === `${row.original.id}:word` ? 'i-lucide-square' : 'i-lucide-volume-2'"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :aria-label="speakingTarget === `${row.original.id}:word` ? `停止朗读 ${row.original.word}` : `朗读单词 ${row.original.word}`"
                    @click="speak(row.original.word, `${row.original.id}:word`)"
                  >
                    单词
                  </UButton>
                  <UButton
                    v-if="row.original.example"
                    :icon="speakingTarget === `${row.original.id}:example` ? 'i-lucide-square' : 'i-lucide-volume-2'"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :aria-label="speakingTarget === `${row.original.id}:example` ? '停止朗读例句' : `朗读例句 ${row.original.example}`"
                    @click="speak(row.original.example, `${row.original.id}:example`)"
                  >
                    例句
                  </UButton>
                </div>
              </template>
            </UTable>
          </div>

          <template #footer>
            <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <span class="text-muted">每页 {{ PAGE_SIZE }} 条</span>
              <UPagination
                v-model:page="page"
                :total="wordbook.words.length"
                :items-per-page="PAGE_SIZE"
                show-edges
                :sibling-count="1"
              />
            </div>
          </template>
        </UCard>

        <UAlert
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          title="这个地址可以刷新"
          description="词书保存在当前浏览器中；导出的 TSV 始终包含全部词条。地址不能跨浏览器或跨设备使用。"
        />
      </template>
    </UContainer>
  </main>
</template>
