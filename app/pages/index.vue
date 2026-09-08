<script setup lang="ts">
import type { StoredWordbookSummary } from '~/composables/useWordbook'

const { importZip, saveWordbook, listWordbooks } = useWordbook()
const toast = useToast()
const selectedFile = ref<File | null>(null)
const savedWordbooks = shallowRef<StoredWordbookSummary[]>([])
const loadingWordbooks = ref(true)
const pending = ref(false)
const error = ref('')

function formatImportedAt(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function loadSavedWordbooks() {
  try {
    savedWordbooks.value = await listWordbooks()
  } catch (reason: unknown) {
    error.value = reason instanceof Error ? reason.message : '无法读取已导入的词书列表。'
  } finally {
    loadingWordbooks.value = false
  }
}

watch(selectedFile, async (file) => {
  if (!file) return
  pending.value = true
  error.value = ''

  try {
    const wordbook = await importZip(file)
    const stored = await saveWordbook(wordbook)
    toast.add({
      title: '词书导入成功',
      description: `已保存 ${stored.words.length.toLocaleString()} 个去重词条`,
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    await navigateTo(`/vocab/${stored.storageId}`)
  } catch (reason: unknown) {
    error.value = reason instanceof Error ? reason.message : '无法读取这个词书。'
  } finally {
    selectedFile.value = null
    pending.value = false
  }
})

onMounted(loadSavedWordbooks)
</script>

<template>
  <main class="min-h-screen py-10 sm:py-16">
    <UContainer class="max-w-3xl space-y-8">
      <header>
        <UBadge color="primary" variant="soft">WORD BOOK</UBadge>
        <h1 class="mt-4 font-display text-4xl tracking-tight sm:text-5xl">词书转 Anki</h1>
        <p class="mt-3 text-muted">导入 ZIP 后，词书会保存在这个浏览器中。</p>
      </header>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="导入失败"
        :description="error"
      />

      <section v-if="loadingWordbooks" class="space-y-3">
        <USkeleton class="h-7 w-32" />
        <USkeleton class="h-24 w-full" />
      </section>

      <section v-else-if="savedWordbooks.length" class="space-y-3">
        <h2 class="font-display text-2xl">已导入词书</h2>
        <UCard
          v-for="wordbook in savedWordbooks"
          :key="wordbook.storageId"
          :ui="{ body: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between' }"
        >
          <div>
            <p>{{ wordbook.id }}</p>
            <p class="mt-1 text-muted">
              {{ wordbook.wordCount.toLocaleString() }} 个词条 · {{ formatImportedAt(wordbook.importedAt) }}
            </p>
          </div>
          <UButton :to="`/vocab/${wordbook.storageId}`" trailing-icon="i-lucide-arrow-right">
            进入词表
          </UButton>
        </UCard>
      </section>

      <section class="space-y-3">
        <h2 v-if="savedWordbooks.length" class="font-display text-2xl">导入新词书</h2>

        <UFileUpload
          v-model="selectedFile"
          accept=".zip,application/zip"
          variant="area"
          label="选择或拖入词书 ZIP"
          description="压缩包中需要包含 kajweb/dict 格式的 JSON 词书文件"
          :disabled="pending"
          reset
          class="min-h-56 w-full"
        />
      </section>

      <UAlert
        color="info"
        variant="subtle"
        icon="i-lucide-hard-drive"
        title="保存在本机"
        description="导入完成后会进入独立词表地址。刷新页面仍可继续浏览；清除浏览器网站数据后需要重新导入。"
      />
    </UContainer>
  </main>
</template>
