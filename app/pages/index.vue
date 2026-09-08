<script setup lang="ts">
const { importZip, saveWordbook } = useWordbook()
const toast = useToast()
const selectedFile = ref<File | null>(null)
const pending = ref(false)
const error = ref('')

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
