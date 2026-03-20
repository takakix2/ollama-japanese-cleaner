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

This is especially noticeable in **SSE streaming** where tokens are sent one by one.

## Features

- **Zero dependencies** — single file, copy-paste ready
- **14 cleanup rules** — CJK, katakana, numbers, filenames, punctuation, markdown
- **Safe for English** — `cjkOnly` guard prevents breaking normal English text
- **Universal** — works in Node.js (CJS/ESM) and browsers

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

## Supported Patterns

| # | Category | Before → After |
|---|---|---|
| 1 | **Kanji** | `私 の 役 割` → `私の役割` |
| 2 | **Hiragana** | `あ い う え お` → `あいうえお` |
| 3 | **Katakana** | `ア シ ス タ ン ト` → `アシスタント` |
| 4 | **CJK ↔ ASCII** | `技術 ドキュメント AI` → `技術ドキュメントAI` |
| 5 | **Numbers** | `2 0 2 6 年` → `2026年` |
| 6 | **Symbols** | `. md` → `.md` |
| 7 | **Underscores** | `FLUX _ PRIORITY` → `FLUX_PRIORITY` |
| 8 | **English fragments** | `SK ILL` → `SKILL` *(CJK context only)* |
| 9 | **Punctuation** | `契約書 、 訴状` → `契約書、訴状` |
| 10 | **Brackets** | `（ 再帰 的 ）` → `（再帰的）` |
| 11 | **Markdown escape** | `\_test\_` → `_test_` |
| 12 | **Bold** | `** 太字 **` → `**太字**` |

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

## Tested Models

- `gemma3:12b` — production use in [Lethe](https://github.com/takaki2/Lethe)
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

これは SSE ストリーミングで1トークンずつ送信する場合に特に顕著になります。

## 対応パターン

| # | カテゴリ | 変換前 → 変換後 |
|---|---|---|
| 1 | **漢字同士** | `私 の 役 割` → `私の役割` |
| 2 | **ひらがな** | `あ い う え お` → `あいうえお` |
| 3 | **カタカナ** | `ア シ ス タ ン ト` → `アシスタント` |
| 4 | **CJK ↔ ASCII** | `技術 ドキュメント に関する AI` → `技術ドキュメントに関するAI` |
| 5 | **数字** | `2 0 2 6 年` → `2026年` |
| 6 | **記号周り** | `. md` → `.md`, `_ REPORT` → `_REPORT` |
| 7 | **アンダースコア** | `FLUX _ PRI ORITY _ PRO POSAL` → `FLUX_PRIORITY_PROPOSAL` |
| 8 | **英字断片** | `SK ILL` → `SKILL` *(CJK文中のみ)* |
| 9 | **句読点** | `契約書 、 訴状` → `契約書、訴状` |
| 10 | **括弧** | `（ 再帰 的 ）` → `（再帰的）` |
| 11 | **マークダウンエスケープ** | `\_test\_` → `_test_` |
| 12 | **太字** | `** 太字 **` → `**太字**` |

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
- **カスタマイズ可能**: `RULES` 配列をエクスポートしているため、ルールの追加・無効化が可能。

## テスト

```bash
npm test
# 35 passed, 0 failed, 35 total
# 🎉 全テスト合格！
```
