/**
 * テストスイート: ollama-japanese-cleaner
 * 
 * Usage: node test.js
 */

const { cleanOllamaJapanese } = require('./ollama-japanese-cleaner.js');

let passed = 0;
let failed = 0;

function test(name, input, expected) {
  const result = cleanOllamaJapanese(input);
  if (result === expected) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     入力:   "${input}"`);
    console.log(`     期待:   "${expected}"`);
    console.log(`     実際:   "${result}"`);
  }
}

console.log('\n🧪 ollama-japanese-cleaner テストスイート\n');

// ── 基本: CJK 同士 ──
console.log('── CJK 同士のスペース除去 ──');
test('漢字同士', '私 の 役 割', '私の役割');
test('ひらがな同士', 'あ い う え お', 'あいうえお');
test('カタカナ同士', 'ア シ ス タ ン ト', 'アシスタント');
test('漢字+ひらがな', '該当 する 情報', '該当する情報');
test('カタカナ+漢字', 'ソフトウェア 開発', 'ソフトウェア開発');
test('混合文', '私 は 個人 の 知識 管理 ア シ ス タ ン ト です', '私は個人の知識管理アシスタントです');

// ── CJK ↔ 英数字 ──
console.log('\n── CJK ↔ ASCII ──');
test('漢字→英字', '技術 ド キ ュ メ ン ト に関する AI', '技術ドキュメントに関するAI');
test('英字→漢字', 'AI が 回答 する', 'AIが回答する');
test('漢字→数字', '第 3 回 会議', '第3回会議');

// ── 数字 ──
console.log('\n── 数字 ──');
test('年号', '2 0 2 6 年', '2026年');
test('数値', '1 0 0 0 件', '1000件');
test('バージョン', 'v 1. 2. 3', 'v1.2.3');

// ── ファイル名 ──
console.log('\n── ファイル名 ──');
test('.md 拡張子', 'ファイル SK ILL. md', 'ファイルSKILL.md');
test('.txt 拡張子', 'ファイル README. txt', 'ファイルREADME.txt');
test('アンダースコア付き', 'ファイル FLUX _ PRIORITY _ PROPOSAL. md', 'ファイルFLUX_PRIORITY_PROPOSAL.md');
test('日本語ファイル名', 'さ か な さん は つま み たい. md', 'さかなさんはつまみたい.md');

// ── 英字断片（日本語文中） ──
console.log('\n── 英字断片の結合 ──');
test('SK ILL（CJK文中）', 'ファイル SK ILL. md', 'ファイルSKILL.md');
test('PR OPOSAL（CJK文中）', '提案 PR OPOSAL', '提案PROPOSAL');
test('FLUX_PRI ORITY（CJK文中）', 'ファイル FLUX _ PRI ORITY _ PRO POSAL. md', 'ファイルFLUX_PRIORITY_PROPOSAL.md');
test('英語文は維持', 'Hello World', 'Hello World');
test('3語以上は維持', 'The Quick Fox', 'The Quick Fox');
test('純英字断片は維持', 'SK ILL', 'SK ILL');

// ── 句読点・括弧 ──
console.log('\n── 句読点・括弧 ──');
test('読点', '契約書 、 訴状 、 議事録', '契約書、訴状、議事録');
test('句点', '以上 です 。', '以上です。');
test('括弧開', '（ 再帰 的 ）', '（再帰的）');
test('括弧閉', '「 テスト 」', '「テスト」');

// ── 全角括弧（v1.1.0 追加） ──
console.log('\n── 全角括弧・コロン ──');
test('CJK + 全角開き括弧', 'です （ファイル', 'です（ファイル');
test('全角閉じ括弧 + CJK', '家 ）」 です', '家）」です');
test('ASCII + 全角閉じ括弧', 'md ）。', 'md）。');
test('全角開き括弧 + ASCII', '（ file', '（file');
test('CJK + 半角コロン', 'ファイル :01', 'ファイル:01');
test('全角コロン', '項目 ： 値', '項目：値');
test('全角括弧複合', '「 リード （ 演出 家 ）」 です', '「リード（演出家）」です');
test('混合括弧パターン', 'です （ ファイル : 0 1 _ Role . md ）。', 'です（ファイル:01_Role.md）。');
test('中黒', 'ア ・ イ ・ ウ', 'ア・イ・ウ');

// ── 英字短断片（v1.1.0 追加） ──
console.log('\n── 英字短断片の結合 ──');
test('2+2結合（CJK文中）', 'テスト eB PF 確認', 'テストeBPF確認');
test('1+2結合（CJK文中）', 'テスト e BP 確認', 'テストeBP確認');
test('1+2+1段階結合', '検索 「 e BP F 」 完了', '検索「eBPF」完了');
test('2+2純英字は維持', 'eB PF', 'eB PF');  // CJKなしは維持

// ── 統合テスト（実際のLLM出力） ──
console.log('\n── 統合テスト（実LLM出力） ──');
test('ロール紹介文', '「 リード ・ スク リ プト ・ アナ リスト （ 演出 家 兼 脚本 家 ）」 です （ ファイル : 0 1 _ Role _ and _ Workflow . md ）。', '「リード・スクリプト・アナリスト（演出家兼脚本家）」です（ファイル:01_Role_and_Workflow.md）。');
test('検索履歴文', '「 e BP F 」 について 検索 し 、 「 README . ja 」「 2 0 2 6 - 0 2 - 1 3 _ Daily 」 を参照', '「eBPF」について検索し、「README.ja」「2026-02-13_Daily」を参照');
test('技術用語', 'ポスト プロ セ ッシング', 'ポストプロセッシング');
test('設計図表現', '技術 的 設計 図 （ ビ ジュアル ・ ブル ープ リ ント ）', '技術的設計図（ビジュアル・ブループリント）');

// ── マークダウン ──
console.log('\n── マークダウン ──');
test('エスケープ除去', '\\_test\\_case', '_test_case');
test('太字周り', '** 太字 ** テスト', '**太字**テスト');
test('アスタリスク', '\\*重要\\*', '*重要*');

// ── エッジケース ──
console.log('\n── エッジケース ──');
test('空文字', '', '');
test('null', null, '');
test('undefined', undefined, '');
test('スペースなし', '正常なテキスト', '正常なテキスト');
test('英語のみ', 'This is a normal English sentence.', 'This is a normal English sentence.');
test('改行保持', '行1\n行 2', '行1\n行2');

// ── 結果 ──
console.log('\n' + '═'.repeat(50));
console.log(`結果: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  console.log('⚠️  一部テストが失敗しています');
  process.exit(1);
} else {
  console.log('🎉 全テスト合格！');
}
