/**
 * ollama-japanese-cleaner.js
 * 
 * Ollama (LLM) が生成する日本語テキストのトークン化アーティファクトを除去する。
 * Ollama はサブワードトークナイザを使うため、日本語テキストにトークン境界の
 * スペースが挿入される。このライブラリはそれらを安全に除去する。
 * 
 * Usage (ESM):
 *   import { cleanOllamaJapanese } from './ollama-japanese-cleaner.js';
 *   const cleaned = cleanOllamaJapanese(rawText);
 * 
 * Usage (Browser):
 *   <script src="ollama-japanese-cleaner.js"></script>
 *   const cleaned = cleanOllamaJapanese(rawText);
 * 
 * Usage (CommonJS):
 *   const { cleanOllamaJapanese } = require('./ollama-japanese-cleaner.js');
 * 
 * @license MIT
 * @version 1.1.0
 */

// ── Unicode 範囲定数 ──────────────────────────────────
// ひらがな: U+3040-309F, カタカナ: U+30A0-30FF
// CJK統合漢字: U+4E00-9FFF, CJK互換: U+F900-FAFF
// CJK統合漢字拡張A: U+3400-4DBF
// 全角記号: U+3000-303F
// 半角カタカナ: U+FF65-FF9F

const CJK_RE = /[\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF65-\uFF9F]/;

// ── ルール定義 ─────────────────────────────────────────

const RULES = [
  // Phase 1: マークダウンエスケープ除去
  { pattern: /\\([_*`~])/g, replacement: '$1', phase: 0 },

  // Phase 2: CJK 同士のスペース除去（漢字・ひらがな・カタカナ）
  {
    pattern: /([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF65-\uFF9F]) ([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF65-\uFF9F])/g,
    replacement: '$1$2',
    phase: 1,
  },

  // Phase 3: CJK ↔ ASCII/数字 間のスペース除去
  {
    pattern: /([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF65-\uFF9F]) ([a-zA-Z0-9_])/g,
    replacement: '$1$2',
    phase: 1,
  },
  {
    pattern: /([a-zA-Z0-9_]) ([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF65-\uFF9F])/g,
    replacement: '$1$2',
    phase: 1,
  },

  // Phase 4: 数字同士のスペース除去 「2 0 2 6」→「2026」
  { pattern: /(\d) (\d)/g, replacement: '$1$2', phase: 1 },

  // Phase 5: 記号周りのスペース除去
  // ドット、アンダースコア、ハイフン、スラッシュ、コロン + 英数字
  { pattern: /([._\-\\/:]) ([a-zA-Z0-9])/g, replacement: '$1$2', phase: 1 },
  { pattern: /([a-zA-Z0-9]) ([._\-\\/:,])/g, replacement: '$1$2', phase: 1 },
  // アンダースコア周り特化: 「FLUX _ PRIORITY」→「FLUX_PRIORITY」
  { pattern: /([a-zA-Z0-9]) _ ([a-zA-Z0-9])/g, replacement: '$1_$2', phase: 1 },

  // Phase 6: 英字の短い断片を結合（CJK含有テキストのみ。純英文では誤結合する）
  // 1-2文字 + スペース + 3文字以上: 「SK ILL」→「SKILL」
  { pattern: /\b([a-zA-Z]{1,2}) ([a-zA-Z]{3,})\b/g, replacement: '$1$2', phase: 1, cjkOnly: true },
  // 3文字以上 + スペース + 1-2文字: 「PROPOS AL」→「PROPOSAL」
  { pattern: /\b([a-zA-Z]{3,}) ([a-zA-Z]{1,2})\b/g, replacement: '$1$2', phase: 1, cjkOnly: true },
  // 2文字 + スペース + 2文字: 「eB PF」→「eBPF」
  { pattern: /\b([a-zA-Z]{2}) ([a-zA-Z]{2})\b/g, replacement: '$1$2', phase: 1, cjkOnly: true },
  // 1文字 + スペース + 2文字: 「e BP」→「eBP」
  { pattern: /\b([a-zA-Z]) ([a-zA-Z]{2})\b/g, replacement: '$1$2', phase: 1, cjkOnly: true },
  // アンダースコア直後の断片: 「_PRI ORITY」→「_PRIORITY」
  { pattern: /_([a-zA-Z]+) ([a-zA-Z]+)/g, replacement: '_$1$2', phase: 1, cjkOnly: true },
  // 単一英字 + スペース + 数字: 「v 1」→「v1」
  { pattern: /\b([a-zA-Z]) (\d)/g, replacement: '$1$2', phase: 1 },


  // Phase 7: 日本語句読点・括弧周りのスペース除去
  // CJK の後に閉じ系（句読点・閉じ括弧）
  {
    pattern: /([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uFF65-\uFF9F]) ([、。，．！？：；）」』】〉》\uFF09\uFF01\uFF1A\uFF1B])/g,
    replacement: '$1$2',
    phase: 1,
  },
  // 開き系（開き括弧）の後に CJK
  {
    pattern: /([（「『【〈《\uFF08]) ([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uFF65-\uFF9F])/g,
    replacement: '$1$2',
    phase: 1,
  },
  // CJK の後に開き括弧
  {
    pattern: /([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uFF65-\uFF9F]) ([（「『【〈《\uFF08])/g,
    replacement: '$1$2',
    phase: 1,
  },
  // 閉じ括弧の後に CJK
  {
    pattern: /([）」』】〉》\uFF09]) ([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uFF65-\uFF9F])/g,
    replacement: '$1$2',
    phase: 1,
  },
  // CJK + 半角コロン/セミコロン
  {
    pattern: /([\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uFF65-\uFF9F]) ([:;])/g,
    replacement: '$1$2',
    phase: 1,
  },
  // ASCII/数字 + 全角閉じ括弧: 「md ）」→「md）」
  {
    pattern: /([a-zA-Z0-9]) ([）」』】〉》\uFF09])/g,
    replacement: '$1$2',
    phase: 1,
  },
  // 全角開き括弧 + ASCII/数字: 「（ file」→「（file」
  {
    pattern: /([（「『【〈《\uFF08]) ([a-zA-Z0-9])/g,
    replacement: '$1$2',
    phase: 1,
  },

  // Phase 8: マークダウン記号周りのスペース: 「** 太字 **」→「**太字**」
  { pattern: /(\*\*) ([\u3000-\u9FFF\uF900-\uFAFF])/g, replacement: '$1$2', phase: 1 },
  { pattern: /([\u3000-\u9FFF\uF900-\uFAFF]) (\*\*)/g, replacement: '$1$2', phase: 1 },
];

// ── メイン関数 ─────────────────────────────────────────

/**
 * Ollama が生成した日本語テキストからトークン化スペースを除去する。
 * 
 * @param {string} text - Ollama の生成テキスト
 * @param {object} [options] - オプション
 * @param {number} [options.maxIterations=10] - 最大繰り返し回数
 * @returns {string} クリーンアップされたテキスト
 */
function cleanOllamaJapanese(text, options = {}) {
  if (!text || typeof text !== 'string') return text || '';

  const maxIter = options.maxIterations || 10;
  let r = text;

  // Phase 0: 一回だけ適用するルール
  for (const rule of RULES) {
    if (rule.phase === 0) {
      r = r.replace(rule.pattern, rule.replacement);
    }
  }

  // Phase 1: 収束するまで反復適用
  const iterRules = RULES.filter(rule => rule.phase === 1);
  const hasCJK = CJK_RE.test(r);
  for (let i = 0; i < maxIter; i++) {
    const prev = r;
    for (const rule of iterRules) {
      // 英字断片結合ルールはCJK含有テキストのみ適用（純英文誤結合防止）
      if (rule.cjkOnly && !hasCJK) continue;
      r = r.replace(rule.pattern, rule.replacement);
    }
    if (r === prev) break;
  }

  return r;
}

// ── エクスポート ────────────────────────────────────────

// ESM
if (typeof exports !== 'undefined') {
  // CommonJS / Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cleanOllamaJapanese, RULES, CJK_RE };
    module.exports.default = cleanOllamaJapanese;
  }
  exports.cleanOllamaJapanese = cleanOllamaJapanese;
  exports.RULES = RULES;
  exports.CJK_RE = CJK_RE;
} else if (typeof globalThis !== 'undefined') {
  // ブラウザ
  globalThis.cleanOllamaJapanese = cleanOllamaJapanese;
}
