# 🧹 ollama-japanese-cleaner

> Remove tokenization spacing artifacts from Ollama / local LLM Japanese text output.

[🇯🇵 日本語ドキュメントは下部にあります](#-日本語)

---

## The Problem

Ollama (gemma3, llama3, etc.) uses **subword tokenizers** that insert spaces at token boundaries when generating Japanese text:

```
LLM output:  私 の 役 割 は、個 人 の 知 識 管 理 ア シ ス タ ン ト です。
After clean: 私の役割は、個人の知識管理アシスタントです。
```

Full-width brackets and mixed ASCII are also affected:

```
LLM output:  「 リード ・ スク リ プト （ 演出 家 ）」 です （ ファイル : name . md ）。
After clean: 「リード・スクリプト（演出家）」です（ファイル:name.md）。
```

This is especially noticeable in **SSE streaming** where tokens are sent one by one.

## Features

- **Zero dependencies** — single file, copy-paste ready
- **21 cleanup rules** — CJK, katakana, numbers, filenames, punctuation, brackets (full-width & half-width), colon, markdown, short English fragments
- **Safe for English** — `cjkOnly` guard prevents breaking normal English text
- **Universal** — works in Node.js (CJS/ESM) and browsers
- **Iterative convergence** — rules applied until no more changes (max 10 iterations)

## Install

```bash
# npm
npm install ollama-japanese-cleaner

# or just copy the file
cp ollama-japanese-cleaner.js your-project/
```

## Usage

```javascript
const { cleanOllamaJapanese } = require('ollama-japanese-cleaner');

const raw = '私 の 役 割 は ア シ ス タ ン ト です。';
console.log(cleanOllamaJapanese(raw));
// → 私の役割はアシスタントです。
```

### Browser

```html
<script src="ollama-japanese-cleaner.js"></script>
<script>
  const cleaned = cleanOllamaJapanese(rawText);
</script>
```

### SSE Streaming

```javascript
let text = '';
eventSource.onmessage = (e) => {
  text += e.data;
  el.textContent = text;                            // raw during stream
};
eventSource.addEventListener('done', () => {
  el.textContent = cleanOllamaJapanese(text);       // clean after done
});
```

## Supported Patterns (21 Rules)

| # | Category | Before → After |
|---|---|---|
| 1 | **Markdown escape** | `\_test\_` → `_test_` |
| 2 | **Kanji / Hiragana / Katakana** | `私 の 役 割` → `私の役割` |
| 3 | **CJK ↔ ASCII** | `技術 ドキュメント AI` → `技術ドキュメントAI` |
| 4 | **Digits** | `2 0 2 6 年` → `2026年` |
| 5 | **Dot / Slash / Colon** | `. md` → `.md`, `/ path` → `/path` |
| 6 | **Underscores** | `FLUX _ PRIORITY` → `FLUX_PRIORITY` |
| 7 | **English fragments (1-2 + 3+)** | `SK ILL` → `SKILL` *(CJK context only)* |
| 8 | **English fragments (2+2)** | `eB PF` → `eBPF` *(CJK context only)* |
| 9 | **English fragments (1+2)** | `e BP` → `eBP` *(CJK context only)* |
| 10 | **Single char + digit** | `v 1` → `v1` |
| 11 | **CJK + closing punct** | `文書 、 解析 。` → `文書、解析。` |
| 12 | **Opening bracket + CJK** | `「 演出` → `「演出` |
| 13 | **CJK + opening bracket** | `です （ファイル` → `です（ファイル` |
| 14 | **Closing bracket + CJK** | `）です` → `）です` |
| 15 | **CJK + half-width colon** | `ファイル :01` → `ファイル:01` |
| 16 | **ASCII + full-width close** | `md ）` → `md）` |
| 17 | **Full-width open + ASCII** | `（ file` → `（file` |
| 18 | **Bold markers** | `** 太字 **` → `**太字**` |

> Rules 7-9 use iterative convergence: `e BP F` → `eBP F` → `eBPF` (2 iterations).  
> Rules 11-17 handle both standard brackets (`「」（）`) and full-width ASCII variants (`\uFF08\uFF09`).

### ⚠️ SSE Streaming: Watch for `\r`

Some SSE implementations send `\r\n` line endings. If you split on `\n` only, trailing `\r` characters will remain in your data and **the cleaner won't match them** (it only matches spaces).

```javascript
// ✅ Fix: strip \r before processing
buffer += decoder.decode(value, { stream: true });
const lines = buffer.replace(/\r/g, '').split('\n');
```

## Test

```bash
npm test
# 35 passed, 0 failed
```

## API

### `cleanOllamaJapanese(text, options?)`

| Param | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Raw LLM output text |
| `options.maxIterations` | `number` | `10` | Max cleanup iterations |

Returns: cleaned `string`

### `RULES`

Exported array of rule objects. You can push your own rules:

```javascript
const { RULES } = require('ollama-japanese-cleaner');
RULES.push({ pattern: /custom/g, replacement: 'fix', phase: 1 });
```

Each rule has:
- `pattern` — RegExp with `/g` flag
- `replacement` — replacement string
- `phase` — `0` (apply once) or `1` (apply iteratively)
- `cjkOnly` — optional, if `true` only applied when CJK chars exist in text

## Tested Models

- `gemma3:12b` — production use in [Lethe](https://github.com/takakix2/Lethe)
- Should work with any Ollama model that exhibits the same tokenization artifacts

## License

MIT

---

---

# 🇯🇵 日本語

## 🧹 ollama-japanese-cleaner

Ollama / ローカル LLM が生成する日本語テキストの **トークン化アーティファクト** を除去するゼロ依存ライブラリ。

## なぜ必要か

Ollama（gemma3, llama3 等）は **サブワードトークナイザ** を使用しており、日本語テキストを生成するとトークン境界にスペースが挿入されます：

```
LLM出力:  私 の 役 割 は、個 人 の 知 識 管 理 ア シ ス タ ン ト です。
整形後:   私の役割は、個人の知識管理アシスタントです。
```

全角括弧や ASCII 混在パターンも影響を受けます：

```
LLM出力:  「 リード ・ スクリプト （ 演出 家 ）」 です （ ファイル : name . md ）。
整形後:   「リード・スクリプト（演出家）」です（ファイル:name.md）。
```

これは SSE ストリーミングで1トークンずつ送信する場合に特に顕著になります。

## 対応パターン（21ルール）

| # | カテゴリ | 変換前 → 変換後 |
|---|---|---|
| 1 | **マークダウンエスケープ** | `\_test\_` → `_test_` |
| 2 | **漢字・ひらがな・カタカナ** | `私 の 役 割` → `私の役割` |
| 3 | **CJK ↔ ASCII** | `技術 ドキュメント AI` → `技術ドキュメントAI` |
| 4 | **数字** | `2 0 2 6 年` → `2026年` |
| 5 | **記号周り** | `. md` → `.md`, `_ REPORT` → `_REPORT` |
| 6 | **アンダースコア** | `FLUX _ PRI ORITY` → `FLUX_PRIORITY` |
| 7 | **英字断片 (1-2 + 3+)** | `SK ILL` → `SKILL` *(CJK文中のみ)* |
| 8 | **英字断片 (2+2)** | `eB PF` → `eBPF` *(CJK文中のみ)* |
| 9 | **英字断片 (1+2)** | `e BP` → `eBP` *(CJK文中のみ)* |
| 10 | **英字1文字 + 数字** | `v 1` → `v1` |
| 11 | **CJK + 閉じ句読点** | `文書 、 解析 。` → `文書、解析。` |
| 12 | **開き括弧 + CJK** | `「 演出` → `「演出` |
| 13 | **CJK + 開き括弧** | `です （ファイル` → `です（ファイル` |
| 14 | **閉じ括弧 + CJK** | `）です` → `）です` |
| 15 | **CJK + 半角コロン** | `ファイル :01` → `ファイル:01` |
| 16 | **ASCII + 全角閉じ括弧** | `md ）` → `md）` |
| 17 | **全角開き括弧 + ASCII** | `（ file` → `（file` |
| 18 | **太字マーカー** | `** 太字 **` → `**太字**` |

> ルール7-9 は反復収束で段階結合: `e BP F` → `eBP F` → `eBPF`（2回の反復）。  
> ルール11-17 は標準括弧（`「」（）`）と全角ASCII括弧（`\uFF08\uFF09`）の両方に対応。

### ⚠️ SSE ストリーミング利用時の注意

SSE の実装によっては `\r\n` で行が区切られます。`\n` のみで split すると `\r` が data に残り、**クリーナーがマッチしなくなります**（スペースのみ対象のため）。

```javascript
// ✅ 対策: \r を事前に除去
buffer += decoder.decode(value, { stream: true });
const lines = buffer.replace(/\r/g, '').split('\n');
```

## 使い方

### Node.js (CommonJS)

```javascript
const { cleanOllamaJapanese } = require('ollama-japanese-cleaner');

const raw = '私 の 役 割 は ア シ ス タ ン ト です。';
console.log(cleanOllamaJapanese(raw));
// → 私の役割はアシスタントです。
```

### ブラウザ

```html
<script src="ollama-japanese-cleaner.js"></script>
<script>
  const cleaned = cleanOllamaJapanese(rawText);
  document.getElementById('output').textContent = cleaned;
</script>
```

### SSE ストリーミングでの使用例

```javascript
let text = '';
eventSource.onmessage = (e) => {
  text += e.data;
  el.textContent = text;             // ストリーム中はそのまま表示
};
eventSource.addEventListener('done', () => {
  el.textContent = cleanOllamaJapanese(text);  // 完了後にクリーンアップ
});
```

## 設計方針

- **`cjkOnly` ガード**: 英字断片結合は CJK 文字を含むテキストのみに適用。純英文を壊さない。
- **収束保証**: ルールを最大10回反復適用し、変化がなくなった時点で終了。
- **全角括弧対応**: `（）`（U+FF08/FF09）や全角コロン `：`（U+FF1A）など、Ollama が出力しがちな全角記号を網羅。
- **カスタマイズ可能**: `RULES` 配列をエクスポートしているため、ルールの追加・無効化が可能。

## テスト

```bash
npm test
# 35 passed, 0 failed, 35 total
# 🎉 全テスト合格！
```
