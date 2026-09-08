<script setup lang="ts">
const { exportBackup, restoreBackup } = useLearningState()
const restoreInput = ref<HTMLInputElement>()
const restored = ref(false)
const restoreError = ref('')

const steps = [
  { title: '安装两个东西', icon: 'i-lucide-download', text: '在 Mac 下载免费的 Anki Desktop；在浏览器注册免费的 AnkiWeb 账号。iPhone 暂时直接用 Safari 打开 AnkiWeb，不购买 AnkiMobile。', link: 'https://apps.ankiweb.net/', linkLabel: '打开 Anki 官网' },
  { title: '导入这份 TSV', icon: 'i-lucide-file-input', text: '回到“词汇工作台”，点击“导出 Anki TSV”。Anki Desktop 中选择 File → Import，选择文件，分隔符选 Tab，允许 HTML。', code: 'listening-desk-cet4.tsv' },
  { title: '设置卡片模板', icon: 'i-lucide-layout-template', text: '字段顺序是 Word、Phonetic、Meaning、Example、ExampleCN、Tags。正面只放 Word，背面放其余字段。', code: '{{Word}}\n{{tts en_US:Word}}' },
  { title: '打开 FSRS', icon: 'i-lucide-brain', text: 'Deck Options → FSRS → Enable。目标记忆率先用 90%，新词每天 8 个。忘记时按 Again，不要按 Hard。', code: 'Again = 忘了 · Good = 记得' },
  { title: '同步到 iPhone', icon: 'i-lucide-refresh-cw', text: 'Mac 点右上角 Sync，登录 AnkiWeb，第一次选择 Upload。iPhone Safari 登录同一账号，之后每天先 Sync 再复习。', link: 'https://docs.ankiweb.net/syncing.html', linkLabel: '查看同步说明' },
  { title: '你的 30 分钟', icon: 'i-lucide-timer', text: '白天静默复习 10 分钟；晚上 8 点后听一条新闻、看文本、再裸听，最后做 60 秒概述。漏一天不补双倍新词。' },
]

async function handleRestore(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  restored.value = false
  restoreError.value = ''
  try {
    await restoreBackup(file)
    restored.value = true
  } catch {
    restoreError.value = '备份文件不是有效的 JSON。'
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <UBadge color="primary" variant="soft">ANKI · FROM ZERO</UBadge>
        <h1 class="mt-5 font-display text-5xl leading-none tracking-[-0.05em] text-highlighted sm:text-6xl">第一次使用，<br><em class="text-primary">照着走就好。</em></h1>
      </div>
      <p class="text-sm leading-6 text-muted">Mac 制卡<br>iPhone 复习</p>
    </header>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="(step, index) in steps" :key="step.title" :ui="{ body: 'flex min-h-60 flex-col p-6' }">
        <div class="flex items-center justify-between">
          <span class="font-display text-xl italic text-primary">{{ String(index + 1).padStart(2, '0') }}</span>
          <UIcon :name="step.icon" class="size-5 text-muted" />
        </div>
        <h2 class="mt-5 font-display text-2xl text-highlighted">{{ step.title }}</h2>
        <p class="mt-3 flex-1 text-sm leading-6 text-muted">{{ step.text }}</p>
        <code v-if="step.code" class="mt-4 whitespace-pre-line rounded-md bg-muted px-3 py-2 text-xs text-toned">{{ step.code }}</code>
        <UButton v-if="step.link" :to="step.link" target="_blank" color="primary" variant="link" trailing-icon="i-lucide-external-link" class="mt-3 self-start">{{ step.linkLabel }}</UButton>
      </UCard>
    </div>

    <UAlert v-if="restored" color="success" variant="soft" icon="i-lucide-circle-check" title="备份已经恢复" />
    <UAlert v-if="restoreError" color="error" variant="soft" icon="i-lucide-circle-alert" title="恢复失败" :description="restoreError" />

    <UCard class="bg-primary/10" :ui="{ body: 'flex flex-col gap-5 p-6 sm:flex-row sm:items-center' }">
      <div class="flex-1">
        <h2 class="font-semibold text-highlighted">换设备前，先备份工作台</h2>
        <p class="mt-1 text-sm leading-6 text-muted">词书和新闻记录保存在当前浏览器。Anki 卡片另由 AnkiWeb 同步。</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton color="neutral" variant="outline" icon="i-lucide-download" @click="exportBackup">导出 JSON 备份</UButton>
        <input ref="restoreInput" class="hidden" type="file" accept=".json" @change="handleRestore">
        <UButton color="neutral" variant="soft" icon="i-lucide-upload" @click="restoreInput?.click()">恢复备份</UButton>
      </div>
    </UCard>
  </div>
</template>
