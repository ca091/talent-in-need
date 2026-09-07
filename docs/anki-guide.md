# Anki 入门：Listening Desk 零成本方案

这份手册对应当前工作台的实际流程：Mac 制卡，AnkiWeb 同步，iPhone Safari 复习。

## 1. 安装和账号

1. 在 [Anki 官网](https://apps.ankiweb.net/) 下载 macOS 版 Anki Desktop。
2. 启动后选择注册 AnkiWeb 账号，或在 [AnkiWeb](https://ankiweb.net/account/register) 注册。
3. iPhone 不需要安装 AnkiMobile。用 Safari 打开 `ankiweb.net`，登录同一个账号即可。

Anki Desktop 免费；AnkiWeb 同步免费。官方 iPhone 应用 AnkiMobile 是一次性付费软件，因此本项目的默认方案使用 Safari。

## 2. 从 Listening Desk 导出

1. 打开“词汇工作台”。
2. 导入 `kajweb/dict` 的词书 ZIP、JSON 或 NDJSON。
3. 先保持释放数量为 100、每日新词为 8。
4. 点击“导出 Anki TSV”，浏览器会下载 `listening-desk-cet4.tsv`。

导出的字段顺序是：

```text
Word    Phonetic    Meaning    Example    ExampleCN    Tags
```

## 3. 在 Mac 导入卡片

1. 打开 Anki Desktop，选择 **File → Import**。
2. 选择 `listening-desk-cet4.tsv`。
3. 分隔符选择 **Tab**；开启 **Allow HTML in fields**。
4. Deck 选择或新建 `Listening Desk::CET4 Core`。
5. 确认字段映射：第 1 列到 Word，第 2 列到 Phonetic，依次对应其余字段。
6. 第一次建议只导入 8～16 张，点击预览确认中文、例句和换行都正常，再导入完整的 100 张。

如果重复导入，Anki 默认会按第一列 Word 更新同名笔记。不要随便修改 Word 字段，否则会失去更新匹配。

## 4. 设置卡片模板和发音

在导入预览中点击 **Cards…**，把正面改成：

```html
<div class="word">{{Word}}</div>
{{tts en_US:Word}}
```

把背面改成：

```html
{{FrontSide}}
<hr id="answer">
<div>{{Phonetic}}</div>
<div>{{Meaning}}</div>
<br>
<div>{{Example}}</div>
<div>{{ExampleCN}}</div>
```

`{{tts en_US:Word}}` 使用 Mac/iPhone 的系统英语语音，不需要 API 或额外付费服务。如果没有声音，在设备的系统语音设置中下载英语语音，并在 Anki 预览中检查模板。

## 5. 设置 FSRS

打开牌组的 **Deck Options**：

- 开启 **FSRS**。
- Desired retention 先保持 `90%`。
- New cards/day 设置为 `8`。
- 学习步骤使用短步骤，例如 `10m 30m`；不要设置跨天学习步骤。
- 忘记答案时按 **Again**；想起来但不太确定按 **Hard**；正常想起按 **Good**。

最重要的一条是：真的忘了不要按 Hard。FSRS 会把 Hard 当作“回忆成功但费力”，否则后续间隔会被拉得过长。

## 6. 第一次同步到 iPhone

1. 在 Mac 点击右上角 **Sync**。
2. 第一次同步时选择 **Upload to AnkiWeb**，把本地刚导入的牌组上传。
3. 在 iPhone Safari 登录同一个 AnkiWeb 账号。
4. 点击同步后复习。
5. 每次在另一台设备使用前，都先同步；结束后也同步一次。

如果出现“本地和云端冲突”，不要连续点击确认。先停止操作，导出本机 JSON/Anki 备份，再选择保留正确的一侧。

## 7. 每天怎么学

### 白天 10 分钟

只做 Anki 到期卡。复习优先于新词；漏一天不要把新词数量翻倍。

### 晚上 20 分钟（20:00 后）

1. 选择一条 Level 2 新闻，第一次只听，不看文字、不暂停。
2. 写下理解率和听到的主题。
3. 看文本，查真正阻碍理解的词。
4. 再听一次，记录新的理解率。
5. 朗读关键段落，做 30～60 秒英文口头概述。
6. 在工作台“听读记录”保存数据。

Level 3 先作为挑战材料，每周加入少量即可。你当前 Level 3 裸听约 10%，此阶段重点是让 Level 2 的声音变得可理解，而不是强行追求更难材料。

## 8. 备份和恢复

工作台的词书、完成勾选和新闻记录保存在当前浏览器的 localStorage 中。进入“Anki 入门”页面，点击“导出 JSON 备份”保存一份文件；换浏览器或清理网站数据前，用“恢复备份”导回。

Anki 卡片和复习进度由 AnkiWeb 管理，另请在 Anki Desktop 定期使用 **File → Export** 导出 `.colpkg` 或 `.apkg`。
