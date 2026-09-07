# Listening Desk

一个零成本、以听力为主线的个人英语学习工作台。它把 `kajweb/dict` 的词书整理成小批量 Anki 卡片，同时记录 News in Levels（或其他新闻/对话材料）的三次听力和每周口述练习。

## 你会得到什么

- 直接导入 `kajweb/dict` 的 `.zip`、`.json` 或 `.ndjson` 词书
- 按词形去重，默认只释放前 100 个词，每天 8 个新词
- 导出带字段和标签的 Anki TSV
- 中文核心义、英美音标、例句和译文预览
- 记录第一次裸听、看文本后、再次裸听的理解率
- 记录 60 秒口头概述是否完成，并查看最近的听力信号
- 所有工作台数据保存在浏览器本机，可导出 JSON 备份

## 启动

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。生产构建：

```bash
pnpm build
```

## 第一次使用

1. 进入“词汇工作台”，先点“先看演示”体验流程，或从 `kajweb/dict` 下载一本词书后直接导入 ZIP。
2. 默认释放 100 个词；每天新词保持 8 个，不要一次导出整本书。
3. 点击“导出 Anki TSV”，在 Mac 的 Anki Desktop 中导入。
4. 按“Anki 入门”页面设置字段模板和原生 TTS：`{{tts en_US:Word}}`。
5. Mac 和 iPhone 使用同一个 AnkiWeb 账号同步。零成本方案是在 iPhone Safari 中打开 AnkiWeb，不购买 AnkiMobile。
6. 每天白天完成 Anki 到期复习，晚上 20:00 后完成一条新闻的听读和 60 秒口述，再在“听读记录”中保存数据。

完整的 Anki 操作、FSRS 设置、导入故障和备份说明见 [`docs/anki-guide.md`](docs/anki-guide.md)。

## 数据边界

工作台不会上传词书、新闻内容或学习记录，也不会调用付费 AI/API。新闻音频由原网站提供，工作台只保存你输入的 URL 和测量结果。`kajweb/dict` 的原始数据来自第三方应用，使用或再分发前请自行确认许可。
