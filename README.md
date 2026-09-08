# 词书转 Anki

一个只在浏览器本地运行的词书转换工具，流程只有三步：

1. 导入 `kajweb/dict` 格式的 ZIP 词书。
2. 分页浏览词书中的全部词条，并使用系统语音朗读单词。
3. 将全部词条导出为 Anki 可导入的 TSV 文件。

分页固定为每页 50 条，只影响页面浏览；导出文件始终包含整本词书。导出的字段为 `Word`、`Phonetic`、`Meaning`、`Example`、`ExampleCN` 和 `Tags`，并声明使用 `Wordbook TTS` 笔记类型。

词书解析、保存、页面朗读和 TSV 生成都在浏览器中完成，文件不会上传到服务器。导入后会跳转到 `/vocab/:id`，词书保存在 IndexedDB 中，因此刷新词表页不需要重新导入。列表朗读使用操作系统提供的英文语音；Anki 原生 TTS 需要首次创建 `Wordbook TTS` 笔记类型，并复制词表页提供的正面、背面模板。模板还包含 AnkiWeb 的浏览器语音兜底，但网页复习时需要手动点击朗读按钮。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3009` 导入词书。要导入另一本词书，从词表页返回首页即可。
