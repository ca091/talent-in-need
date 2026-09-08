import { strFromU8, unzipSync } from 'fflate'

export type Word = {
  id: string
  rank: number
  word: string
  phonetic: string
  meaning: string
  example: string
  exampleCn: string
  bookId: string
}

export type Wordbook = {
  id: string
  words: Word[]
}

export type StoredWordbook = Wordbook & {
  storageId: string
  importedAt: string
}

export type StoredWordbookSummary = {
  storageId: string
  id: string
  wordCount: number
  importedAt: string
}

const DATABASE_NAME = 'wordbook-exporter'
const DATABASE_VERSION = 2
const WORDBOOK_STORE = 'wordbooks'
const WORDBOOK_INDEX_STORE = 'wordbook-index'

function createStorageId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function summarizeWordbook(wordbook: StoredWordbook): StoredWordbookSummary {
  return {
    storageId: wordbook.storageId,
    id: wordbook.id,
    wordCount: wordbook.words.length,
    importedAt: wordbook.importedAt,
  }
}

function openDatabase(): Promise<IDBDatabase> {
  if (!import.meta.client || !('indexedDB' in window)) {
    return Promise.reject(new Error('当前浏览器不支持本地保存词书。'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      const transaction = request.transaction
      const wordbookStore = database.objectStoreNames.contains(WORDBOOK_STORE)
        ? transaction?.objectStore(WORDBOOK_STORE)
        : database.createObjectStore(WORDBOOK_STORE, { keyPath: 'storageId' })

      if (!database.objectStoreNames.contains(WORDBOOK_INDEX_STORE)) {
        const indexStore = database.createObjectStore(WORDBOOK_INDEX_STORE, { keyPath: 'storageId' })
        const cursorRequest = wordbookStore?.openCursor()
        if (cursorRequest) {
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result
            if (!cursor) return
            indexStore.put(summarizeWordbook(cursor.value as StoredWordbook))
            cursor.continue()
          }
        }
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('无法打开浏览器本地词书存储。'))
    request.onblocked = () => reject(new Error('本地词书存储正在被其他页面占用，请关闭旧页面后重试。'))
  })
}

function parseWordLines(text: string, filename: string): Word[] {
  const clean = text.replace(/^\uFEFF/, '').trim()
  if (!clean) throw new Error('词书文件是空的。')

  const parsed: unknown = clean.startsWith('[')
    ? JSON.parse(clean)
    : clean.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
  if (!Array.isArray(parsed)) throw new Error('JSON 词书的内容不是词条列表。')

  return parsed.map((value, index) => {
    const item = value as Record<string, unknown>
    const outerContent = (item.content || {}) as Record<string, unknown>
    const wordNode = (outerContent.word || {}) as Record<string, unknown>
    const content = (wordNode.content || {}) as Record<string, unknown>
    const translations = Array.isArray(content.trans) ? content.trans as Record<string, unknown>[] : []
    const sentenceNode = (content.sentence || {}) as Record<string, unknown>
    const sentences = Array.isArray(sentenceNode.sentences) ? sentenceNode.sentences as Record<string, unknown>[] : []
    const firstSentence = sentences[0] || {}
    const bookId = String(item.bookId || filename.replace(/\.json$/i, ''))
    const word = String(item.headWord || wordNode.wordHead || '').trim()
    const meaning = translations
      .map(translation => `${translation.pos ? `${String(translation.pos)}. ` : ''}${String(translation.tranCn || translation.tranOther || '')}`)
      .filter(Boolean)
      .join('；')

    return {
      id: String(item.wordId || wordNode.wordId || `${bookId}-${word}-${index}`),
      rank: Number(item.wordRank || index + 1),
      word,
      phonetic: String(content.usphone || content.ukphone || '').trim(),
      meaning: meaning || '暂无释义',
      example: String(firstSentence.sContent || '').trim(),
      exampleCn: String(firstSentence.sCn || '').trim(),
      bookId,
    }
  }).filter(item => item.word)
}

export function useWordbook() {
  async function importZip(file: File): Promise<Wordbook> {
    if (!file.name.toLowerCase().endsWith('.zip')) throw new Error('请选择 ZIP 格式的词书。')

    const archive = unzipSync(new Uint8Array(await file.arrayBuffer()))
    const entry = Object.entries(archive).find(([name]) => name.toLowerCase().endsWith('.json'))
    if (!entry) throw new Error('压缩包中没有找到 JSON 词书文件。')

    const parsed = parseWordLines(strFromU8(entry[1]), entry[0])
    const unique = new Map<string, Word>()
    parsed.forEach(word => unique.set(word.word.toLocaleLowerCase(), word))
    const words = [...unique.values()]
    if (!words.length) throw new Error('词书中没有可用的单词。')

    return {
      id: words[0]?.bookId || file.name.replace(/\.zip$/i, ''),
      words,
    }
  }

  function exportAnki(wordbook: Wordbook) {
    const cleanTsv = (value: string) => value.replace(/[\t\r\n]+/g, ' ').trim()
    const deckName = cleanTsv(wordbook.id)
    const header = [
      '#separator:Tab',
      '#html:true',
      '#notetype:Wordbook TTS',
      '#tags column:6',
      '#columns:Word\tPhonetic\tMeaning\tExample\tExampleCN\tTags',
      `#deck:Wordbook::${deckName}`,
      '',
    ].join('\n')
    const rows = wordbook.words.map(word => [
      word.word,
      word.phonetic,
      word.meaning,
      word.example,
      word.exampleCn,
      `dict ${word.bookId}`,
    ].map(cleanTsv).join('\t'))
    const filename = `${wordbook.id.replace(/[^\w.-]+/g, '-') || 'wordbook'}.tsv`
    const url = URL.createObjectURL(new Blob([`${header}${rows.join('\n')}\n`], { type: 'text/tab-separated-values;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function saveWordbook(wordbook: Wordbook): Promise<StoredWordbook> {
    const stored: StoredWordbook = {
      ...wordbook,
      storageId: createStorageId(),
      importedAt: new Date().toISOString(),
    }
    const database = await openDatabase()

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction([WORDBOOK_STORE, WORDBOOK_INDEX_STORE], 'readwrite')
        transaction.objectStore(WORDBOOK_STORE).put(stored)
        transaction.objectStore(WORDBOOK_INDEX_STORE).put(summarizeWordbook(stored))
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(new Error('词书无法保存到浏览器，请检查可用存储空间。'))
        transaction.onabort = () => reject(new Error('词书保存已中止，请重新导入。'))
      })
    } finally {
      database.close()
    }

    return stored
  }

  async function getWordbook(storageId: string): Promise<StoredWordbook | null> {
    const database = await openDatabase()

    try {
      return await new Promise((resolve, reject) => {
        const request = database.transaction(WORDBOOK_STORE, 'readonly')
          .objectStore(WORDBOOK_STORE)
          .get(storageId)
        request.onsuccess = () => resolve((request.result as StoredWordbook | undefined) || null)
        request.onerror = () => reject(new Error('无法读取浏览器中保存的词书。'))
      })
    } finally {
      database.close()
    }
  }

  async function listWordbooks(): Promise<StoredWordbookSummary[]> {
    const database = await openDatabase()

    try {
      const summaries = await new Promise<StoredWordbookSummary[]>((resolve, reject) => {
        const request = database.transaction(WORDBOOK_INDEX_STORE, 'readonly')
          .objectStore(WORDBOOK_INDEX_STORE)
          .getAll()
        request.onsuccess = () => resolve(request.result as StoredWordbookSummary[])
        request.onerror = () => reject(new Error('无法读取已导入的词书列表。'))
      })
      return summaries.sort((left, right) => right.importedAt.localeCompare(left.importedAt))
    } finally {
      database.close()
    }
  }

  return { importZip, exportAnki, saveWordbook, getWordbook, listWordbooks }
}
