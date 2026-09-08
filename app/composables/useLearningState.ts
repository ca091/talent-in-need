import { unzipSync, strFromU8 } from 'fflate'

export type Word = {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  exampleCn: string
  bookId: string
  rank: number
}

export type NewsEntry = {
  id: string
  title: string
  url: string
  level: string
  date: string
  firstListen: number
  afterText: number
  replay: number
  vocabulary: string
  recap: boolean
  note: string
}

type LearningState = {
  words: Word[]
  releasedCount: number
  newPerDay: number
  doneWords: Record<string, string[]>
  newsEntries: NewsEntry[]
}

const STORAGE_KEY = 'listening-desk-v1'
const START_KEY = 'listening-desk-start'

const sampleWords: Word[] = [
  ['retirement', '/rɪˈtaɪəmənt/', 'n. 退休；退出', 'He announced his retirement from international football.', '他宣布退出国际足球比赛。'],
  ['emotional', '/ɪˈməʊʃənəl/', 'adj. 情绪激动的；有感染力的', 'It was an emotional moment for the fans.', '这对球迷来说是一个令人动容的时刻。'],
  ['extraordinary', '/ɪkˈstrɔːdənəri/', 'adj. 非凡的；特别的', 'She had an extraordinary career.', '她拥有一段非凡的职业生涯。'],
  ['legacy', '/ˈleɡəsi/', 'n. 遗产；留下的影响', 'His legacy will live on for many years.', '他的影响将延续很多年。'],
  ['captain', '/ˈkæptɪn/', 'n. 队长；船长；v. 担任队长', 'She captained the team to victory.', '她带领球队取得了胜利。'],
  ['commentator', '/ˈkɒmənteɪtə(r)/', 'n. 评论员；解说员', 'The commentator described the final moments.', '解说员描述了最后的时刻。'],
  ['era', '/ˈɪərə/', 'n. 时代；年代', 'The player marked the end of an era.', '这名球员标志着一个时代的结束。'],
  ['announce', '/əˈnaʊns/', 'v. 宣布；通知', 'The company announced a new plan.', '公司宣布了一项新计划。'],
].map(([word, phonetic, meaning, example, exampleCn], index) => ({
  id: `demo-${word}`,
  word,
  phonetic,
  meaning,
  example,
  exampleCn,
  bookId: 'CET4-demo',
  rank: index + 1,
}))

const defaultState = (): LearningState => ({
  words: [],
  releasedCount: 100,
  newPerDay: 8,
  doneWords: {},
  newsEntries: [],
})

function parseWordLines(text: string, filename: string): Word[] {
  const clean = text.replace(/^\uFEFF/, '').trim()
  const raw: unknown[] = clean.startsWith('[')
    ? JSON.parse(clean)
    : clean.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))

  return raw.map((value, index) => {
    const item = value as Record<string, unknown>
    const outerContent = (item.content || {}) as Record<string, unknown>
    const wordNode = (outerContent.word || {}) as Record<string, unknown>
    const content = (wordNode.content || {}) as Record<string, unknown>
    const translations = Array.isArray(content.trans) ? content.trans as Record<string, unknown>[] : []
    const sentenceNode = (content.sentence || {}) as Record<string, unknown>
    const sentences = Array.isArray(sentenceNode.sentences) ? sentenceNode.sentences as Record<string, unknown>[] : []
    const meaning = translations
      .map(translation => `${translation.pos ? `${String(translation.pos)}. ` : ''}${String(translation.tranCn || translation.tranOther || '')}`)
      .filter(Boolean)
      .join('；')
    const firstSentence = sentences[0] || {}

    return {
      id: String(item.wordId || wordNode.wordId || `${item.bookId || filename}-${item.headWord}-${index}`),
      word: String(item.headWord || wordNode.wordHead || '').trim(),
      phonetic: String(content.usphone || content.ukphone || '').trim(),
      meaning: meaning || '暂无释义',
      example: String(firstSentence.sContent || '').trim(),
      exampleCn: String(firstSentence.sCn || '').trim(),
      bookId: String(item.bookId || filename.replace(/\.json$/i, '')),
      rank: Number(item.wordRank || index + 1),
    }
  }).filter(item => item.word)
}

export function useLearningState() {
  const state = useState<LearningState>('learning-state', defaultState)
  const hydrated = useState<boolean>('learning-state-hydrated', () => false)
  const initializationRegistered = useState<boolean>('learning-state-initialization-registered', () => false)
  const persistenceRegistered = useState<boolean>('learning-state-persistence-registered', () => false)
  const todayKey = new Date().toISOString().slice(0, 10)

  const curriculumWords = computed(() => state.value.words.slice(0, Math.min(state.value.releasedCount, state.value.words.length)))
  const dayNumber = computed(() => {
    if (!hydrated.value || !import.meta.client) return 0
    const start = new Date(localStorage.getItem(START_KEY) || todayKey)
    const now = new Date()
    start.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
  })
  const todaysWords = computed(() => curriculumWords.value.slice(dayNumber.value * state.value.newPerDay, dayNumber.value * state.value.newPerDay + state.value.newPerDay))
  const todayDone = computed(() => state.value.doneWords[todayKey] || [])
  const todayWordProgress = computed(() => todaysWords.value.filter(word => todayDone.value.includes(word.id)).length)
  const todayNews = computed(() => state.value.newsEntries.filter(entry => entry.date === todayKey))
  const completion = computed(() => Math.min(100, Math.round((((todayWordProgress.value > 0 ? 10 : 0) + (todayNews.value.length ? 12 : 0) + (todayNews.value.some(entry => entry.recap) ? 8 : 0)) / 30) * 100)))
  const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0
  const averageFirstListen = computed(() => average(state.value.newsEntries.slice(0, 8).map(item => item.firstListen)))
  const averageReplay = computed(() => average(state.value.newsEntries.slice(0, 8).map(item => item.replay)))
  const recentEntries = computed(() => [...state.value.newsEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6))

  function persist() {
    if (!import.meta.client || !hydrated.value) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  function markWord(word: Word) {
    const current = new Set(state.value.doneWords[todayKey] || [])
    if (current.has(word.id)) current.delete(word.id)
    else current.add(word.id)
    state.value.doneWords[todayKey] = [...current]
    persist()
  }

  function loadDemo() {
    state.value.words = sampleWords
    state.value.releasedCount = sampleWords.length
    persist()
  }

  async function readFile(file: File) {
    if (file.name.toLowerCase().endsWith('.zip')) {
      const archive = unzipSync(new Uint8Array(await file.arrayBuffer()))
      const entry = Object.entries(archive).find(([name]) => name.toLowerCase().endsWith('.json'))
      if (!entry) throw new Error('压缩包里没有找到 JSON 词书文件。')
      return parseWordLines(strFromU8(entry[1]), entry[0])
    }
    return parseWordLines(await file.text(), file.name)
  }

  async function importDictionary(file: File) {
    const imported = await readFile(file)
    const unique = new Map<string, Word>()
    imported.forEach(item => unique.set(item.word.toLowerCase(), item))
    state.value.words = [...unique.values()]
    state.value.releasedCount = Math.min(100, state.value.words.length)
    persist()
    return state.value.words.length
  }

  function saveNews(entry: Omit<NewsEntry, 'id'>) {
    state.value.newsEntries.unshift({ id: crypto.randomUUID(), ...entry })
    persist()
  }

  function cleanTsv(value: string) {
    return value.replace(/[\t\r\n]+/g, ' ').trim()
  }

  function exportAnki() {
    const header = ['#separator:Tab', '#html:true', '#columns:Word\tPhonetic\tMeaning\tExample\tExampleCN\tTags', '#deck:Listening Desk::CET4 Core', ''].join('\n')
    const rows = curriculumWords.value.map(word => [word.word, word.phonetic, word.meaning, word.example, word.exampleCn, `dict-cet4 ${word.bookId}`].map(cleanTsv).join('\t'))
    download('listening-desk-cet4.tsv', `${header}${rows.join('\n')}\n`)
    return rows.length
  }

  function exportBackup() {
    download('listening-desk-backup.json', JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...state.value }, null, 2), 'application/json;charset=utf-8')
  }

  async function restoreBackup(file: File) {
    const data = JSON.parse(await file.text()) as Partial<LearningState>
    state.value.words = data.words || []
    state.value.releasedCount = data.releasedCount || 100
    state.value.newPerDay = data.newPerDay || 8
    state.value.doneWords = data.doneWords || {}
    state.value.newsEntries = data.newsEntries || []
    persist()
  }

  function download(name: string, content: string, type = 'text/plain;charset=utf-8') {
    if (!import.meta.client) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type }))
    link.download = name
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (import.meta.client && !initializationRegistered.value) {
    initializationRegistered.value = true
    onMounted(() => {
      if (!localStorage.getItem(START_KEY)) localStorage.setItem(START_KEY, new Date().toISOString())
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try { Object.assign(state.value, JSON.parse(saved)) } catch { /* start fresh */ }
      }
      hydrated.value = true
    })
  }

  if (import.meta.client && !persistenceRegistered.value) {
    persistenceRegistered.value = true
    watch(state, persist, { deep: true })
  }

  return {
    state,
    todayKey,
    curriculumWords,
    dayNumber,
    todaysWords,
    todayDone,
    todayWordProgress,
    todayNews,
    completion,
    averageFirstListen,
    averageReplay,
    recentEntries,
    markWord,
    loadDemo,
    importDictionary,
    saveNews,
    exportAnki,
    exportBackup,
    restoreBackup,
  }
}
