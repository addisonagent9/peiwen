/**
 * Trainer UI i18n strings.
 *
 * Three locales are supported, driven by user_trainer_state.ui_language:
 *   zh-Hans       — Simplified Chinese (default)
 *   zh-Hant       — Traditional Chinese
 *   en-bilingual  — English labels with Chinese terms preserved
 *
 * Translations are kept tight and domain-accurate. 术语 like 韵部 / 平声 /
 * 入声 are NEVER translated to English even in the bilingual mode — they
 * stay as-is because they're the subject matter itself.
 */

import type { UserTrainerState } from '../types/pingshui-trainer';

export type Locale = UserTrainerState['uiLanguage'];

export interface TrainerStrings {
  // Nav / shell
  navTitle: string;
  navHome: string;
  navDrill: string;
  navDashboard: string;
  backToHome: string;

  // Home screen
  welcomeGreeting: (name?: string) => string;
  currentTierLabel: string;
  cardsDueToday: (n: number) => string;
  streakDays: (n: number) => string;
  startDrill: string;
  continueFoundation: string;
  startFoundation: string;
  reviewFoundation: string;
  foundationLocked: string;

  // Foundation module
  foundationTitle: string;
  foundationSubtitle: string;
  foundationStepOf: (current: number, total: number) => string;
  next: string;
  previous: string;
  markComplete: string;

  // Tier / rhyme listing
  tier1Title: string;
  tier2Title: string;
  tier3Title: string;
  tier1Description: string;
  tier2Description: string;
  tier3Description: string;
  tierLocked: string;
  tierUnlockHint: string;

  // Rhyme detail
  rhymeDetailSeedChars: string;
  rhymeDetailMnemonic: string;
  rhymeDetailStartDrill: string;
  rhymeDetailNoPoem: string;

  // Drill cards in tier view
  drillCard1Title: string;
  drillCard2Title: string;
  drillCard3Title: string;
  drillCard4Title: string;
  drillComingSoon: string;

  // Drill 2 — Recall
  drill2SessionTitle: string;
  drill2Prompt: (rhymeLabel: string) => string;
  drill2Picked: (n: number) => string;
  drill2Submit: string;
  drill2Next: string;
  drill2Correct: (n: number) => string;

  // Drill 3 — Pair discrimination
  drill3SessionTitle: string;
  drill3PromptRhyme: string;

  drill3AnswerYes: string;
  drill3AnswerNo: string;
  drill3CorrectAnswer: string;
  drill3TeachingNote: string;
  drill3Mnemonic: string;
  drill3AnchorPoem: string;
  drill3Continue: string;
  drillTierScoped: string;
  drillGlobal: string;

  // Drill session
  drillSessionTitle: string;
  drillPromptCharToRhyme: string;
  drillStats: (drilled: number, total: number) => string;
  drillContinueNext: string;
  drillExplanation: (char: string, rhyme: string) => string;
  drillSummaryTitle: string;
  drillSummaryStats: (correct: number, total: number) => string;
  drillPickCount5: string;
  drillPickCount10: string;
  drillPickCount20: string;
  drillPickCountAll: string;
  drillHintLabel: string;
  drillHintOn: string;
  drillHintOff: string;
  drillHintShow: string;
  drillHintHide: string;

  // Drill shell (legacy)
  drillCorrect: string;
  drillIncorrect: string;
  drillShowAnswer: string;
  gradeAgain: string; // 0
  gradeHard: string; // 3
  gradeGood: string; // 4
  gradeEasy: string; // 5
  gradeAgainHint: string;
  gradeHardHint: string;
  gradeGoodHint: string;
  gradeEasyHint: string;
  noCardsDueTitle: string;
  noCardsDueBody: string;

  // Dashboard
  dashboardTitle: string;
  masteryLegendNotStarted: string;
  masteryLegendIntroduced: string;
  masteryLegendLearning: string;
  masteryLegendReview: string;
  masteryLegendMastered: string;

  // Common
  loading: string;
  errorGeneric: string;
  retry: string;
}

// ---------------------------------------------------------------------------
// Simplified Chinese (primary)
// ---------------------------------------------------------------------------

const zhHans: TrainerStrings = {
  navTitle: '韵部训练',
  navHome: '主页',
  navDrill: '练习',
  navDashboard: '进度',
  backToHome: '返回主页',

  welcomeGreeting: (name) => (name ? `你好,${name}` : '欢迎'),
  currentTierLabel: '当前层级',
  cardsDueToday: (n) => `今日待复习 ${n} 张`,
  streakDays: (n) => `连续 ${n} 天`,
  startDrill: '开始练习',
  continueFoundation: '继续基础课程',
  startFoundation: '开始基础课程',
  reviewFoundation: '复习基础课程',
  foundationLocked: '请先完成基础课程',

  foundationTitle: '基础课程',
  foundationSubtitle: '四声·平仄·韵目',
  foundationStepOf: (c, t) => `第 ${c} 步 / 共 ${t} 步`,
  next: '下一步',
  previous: '上一步',
  markComplete: '完成基础课程',

  tier1Title: '第一层:入门五韵',
  tier2Title: '第二层:易混辨析',
  tier3Title: '第三层:闭口韵与冷僻',
  tier1Description: '五个最常用、最易辨的平声韵。从此开始。',
  tier2Description: '按家族成组教学 — 正面攻克易混之处。',
  tier3Description: '消失的 -m 闭口音与三江等冷僻韵。',
  tierLocked: '尚未解锁',
  tierUnlockHint: '需完成上一层方可解锁',

  rhymeDetailSeedChars: '核心字',
  rhymeDetailMnemonic: '记忆线索',
  rhymeDetailStartDrill: '开始练习',
  rhymeDetailNoPoem: '这一韵的代表诗正在准备中。',

  drillCard1Title: '第一练: 识韵 (字→韵部)',
  drillCard2Title: '第二练: 回韵 (韵部→字)',
  drillCard3Title: '第三练: 辨韵 (对比)',
  drillCard4Title: '第四练: 应用 (诗韵)',
  drillComingSoon: '即将推出',
  drillTierScoped: '开始本层练习',
  drillGlobal: '开始综合练习',

  drill2SessionTitle: '练习 — 韵部→字',
  drill2Prompt: (r) => `这四个字属于 ${r}?`,
  drill2Picked: (n) => `已选 ${n} / 4`,
  drill2Submit: '提交',
  drill2Next: '下一题',
  drill2Correct: (n) => `正确 ${n} / 4`,

  drill3SessionTitle: '练习 — 辨韵',
  drill3PromptRhyme: '这两个字押韵吗?',

  drill3AnswerYes: '押韵',
  drill3AnswerNo: '不押韵',
  drill3CorrectAnswer: '正确答案',
  drill3TeachingNote: '教学说明',
  drill3Mnemonic: '记忆口诀',
  drill3AnchorPoem: '锚定诗篇',
  drill3Continue: '继续',

  drillSessionTitle: '练习 — 字→韵部',
  drillPromptCharToRhyme: '这个字属于哪个韵?',
  drillStats: (drilled, total) => `已练习 ${drilled} / ${total}`,
  drillContinueNext: '下一题',
  drillExplanation: (char, rhyme) => `${char} 属于 ${rhyme} 韵`,
  drillSummaryTitle: '练习完成',
  drillSummaryStats: (correct, total) => `答对 ${correct} / 总共 ${total}`,
  drillPickCount5: '5 张',
  drillPickCount10: '10 张',
  drillPickCount20: '20 张',
  drillPickCountAll: '全部',
  drillHintLabel: '提示:',
  drillHintOn: '开',
  drillHintOff: '关',
  drillHintShow: '显示提示',
  drillHintHide: '隐藏提示',

  drillCorrect: '答对',
  drillIncorrect: '再想想',
  drillShowAnswer: '查看答案',
  gradeAgain: '重来',
  gradeHard: '勉强',
  gradeGood: '尚可',
  gradeEasy: '轻松',
  gradeAgainHint: '完全忘了',
  gradeHardHint: '想了很久',
  gradeGoodHint: '有些犹豫',
  gradeEasyHint: '脱口而出',
  noCardsDueTitle: '今日已无待复习',
  noCardsDueBody: '明日再见,或去学习新的韵部。',

  dashboardTitle: '我的进度',
  masteryLegendNotStarted: '未开始',
  masteryLegendIntroduced: '已入门',
  masteryLegendLearning: '学习中',
  masteryLegendReview: '复习中',
  masteryLegendMastered: '已掌握',

  loading: '加载中…',
  errorGeneric: '出错了,请稍后再试',
  retry: '重试',
};

// ---------------------------------------------------------------------------
// Traditional Chinese
// ---------------------------------------------------------------------------

const zhHant: TrainerStrings = {
  navTitle: '韻部訓練',
  navHome: '主頁',
  navDrill: '練習',
  navDashboard: '進度',
  backToHome: '返回主頁',

  welcomeGreeting: (name) => (name ? `你好,${name}` : '歡迎'),
  currentTierLabel: '當前層級',
  cardsDueToday: (n) => `今日待複習 ${n} 張`,
  streakDays: (n) => `連續 ${n} 天`,
  startDrill: '開始練習',
  continueFoundation: '繼續基礎課程',
  startFoundation: '開始基礎課程',
  reviewFoundation: '複習基礎課程',
  foundationLocked: '請先完成基礎課程',

  foundationTitle: '基礎課程',
  foundationSubtitle: '四聲·平仄·韻目',
  foundationStepOf: (c, t) => `第 ${c} 步 / 共 ${t} 步`,
  next: '下一步',
  previous: '上一步',
  markComplete: '完成基礎課程',

  tier1Title: '第一層:入門五韻',
  tier2Title: '第二層:易混辨析',
  tier3Title: '第三層:閉口韻與冷僻',
  tier1Description: '五個最常用、最易辨的平聲韻。從此開始。',
  tier2Description: '按家族成組教學 — 正面攻克易混之處。',
  tier3Description: '消失的 -m 閉口音與三江等冷僻韻。',
  tierLocked: '尚未解鎖',
  tierUnlockHint: '需完成上一層方可解鎖',

  rhymeDetailSeedChars: '核心字',
  rhymeDetailMnemonic: '記憶線索',
  rhymeDetailStartDrill: '開始練習',
  rhymeDetailNoPoem: '這一韻的代表詩正在準備中。',

  drillCard1Title: '第一練: 識韻 (字→韻部)',
  drillCard2Title: '第二練: 回韻 (韻部→字)',
  drillCard3Title: '第三練: 辨韻 (對比)',
  drillCard4Title: '第四練: 應用 (詩韻)',
  drillComingSoon: '即將推出',
  drillTierScoped: '開始本層練習',
  drillGlobal: '開始綜合練習',

  drill2SessionTitle: '練習 — 韻部→字',
  drill2Prompt: (r) => `這四個字屬於 ${r}?`,
  drill2Picked: (n) => `已選 ${n} / 4`,
  drill2Submit: '提交',
  drill2Next: '下一題',
  drill2Correct: (n) => `正確 ${n} / 4`,

  drill3SessionTitle: '練習 — 辨韻',
  drill3PromptRhyme: '這兩個字押韻嗎?',

  drill3AnswerYes: '押韻',
  drill3AnswerNo: '不押韻',
  drill3CorrectAnswer: '正確答案',
  drill3TeachingNote: '教學說明',
  drill3Mnemonic: '記憶口訣',
  drill3AnchorPoem: '錨定詩篇',
  drill3Continue: '繼續',

  drillSessionTitle: '練習 — 字→韻部',
  drillPromptCharToRhyme: '這個字屬於哪個韻?',
  drillStats: (drilled, total) => `已練習 ${drilled} / ${total}`,
  drillContinueNext: '下一題',
  drillExplanation: (char, rhyme) => `${char} 屬於 ${rhyme} 韻`,
  drillSummaryTitle: '練習完成',
  drillSummaryStats: (correct, total) => `答對 ${correct} / 總共 ${total}`,
  drillPickCount5: '5 張',
  drillPickCount10: '10 張',
  drillPickCount20: '20 張',
  drillPickCountAll: '全部',
  drillHintLabel: '提示:',
  drillHintOn: '開',
  drillHintOff: '關',
  drillHintShow: '顯示提示',
  drillHintHide: '隱藏提示',

  drillCorrect: '答對',
  drillIncorrect: '再想想',
  drillShowAnswer: '查看答案',
  gradeAgain: '重來',
  gradeHard: '勉強',
  gradeGood: '尚可',
  gradeEasy: '輕鬆',
  gradeAgainHint: '完全忘了',
  gradeHardHint: '想了很久',
  gradeGoodHint: '有些猶豫',
  gradeEasyHint: '脫口而出',
  noCardsDueTitle: '今日已無待複習',
  noCardsDueBody: '明日再見,或去學習新的韻部。',

  dashboardTitle: '我的進度',
  masteryLegendNotStarted: '未開始',
  masteryLegendIntroduced: '已入門',
  masteryLegendLearning: '學習中',
  masteryLegendReview: '複習中',
  masteryLegendMastered: '已掌握',

  loading: '載入中…',
  errorGeneric: '出錯了,請稍後再試',
  retry: '重試',
};

// ---------------------------------------------------------------------------
// Bilingual (English labels, Chinese terms preserved)
// ---------------------------------------------------------------------------

const enBilingual: TrainerStrings = {
  navTitle: '韵部 Trainer',
  navHome: 'Home',
  navDrill: 'Drill',
  navDashboard: 'Progress',
  backToHome: '← Home',

  welcomeGreeting: (name) => (name ? `Welcome, ${name}` : 'Welcome'),
  currentTierLabel: 'Current tier',
  cardsDueToday: (n) => `${n} card${n === 1 ? '' : 's'} due today`,
  streakDays: (n) => `${n}-day streak`,
  startDrill: 'Start drill',
  continueFoundation: 'Continue foundation',
  startFoundation: 'Start foundation',
  reviewFoundation: 'Review foundation',
  foundationLocked: 'Complete the foundation first',

  foundationTitle: 'Foundation',
  foundationSubtitle: 'Four tones · 平/仄 · 韵目',
  foundationStepOf: (c, t) => `Step ${c} of ${t}`,
  next: 'Next',
  previous: 'Back',
  markComplete: 'Mark complete',

  tier1Title: 'Tier 1 — Quick wins',
  tier2Title: 'Tier 2 — Confusable families',
  tier3Title: 'Tier 3 — Closed-lip & rare',
  tier1Description: 'Five distinctive, high-frequency 平声 rhymes. Start here.',
  tier2Description: 'Taught in family groups — confront the traps head-on.',
  tier3Description: 'The lost -m endings and rare categories like 三江.',
  tierLocked: 'Locked',
  tierUnlockHint: 'Master the previous tier first',

  rhymeDetailSeedChars: 'Core characters',
  rhymeDetailMnemonic: 'Memory aid',
  rhymeDetailStartDrill: 'Start drill',
  rhymeDetailNoPoem: 'Anchor poem coming soon.',

  drillCard1Title: 'Drill 1: Recognition (Char → Rhyme)',
  drillCard2Title: 'Drill 2: Recall (Rhyme → Char)',
  drillCard3Title: 'Drill 3: Discrimination (Pair)',
  drillCard4Title: 'Drill 4: Application (Poem)',
  drillComingSoon: 'Coming soon',
  drillTierScoped: 'Start tier drill',
  drillGlobal: 'Start combined drill',

  drill2SessionTitle: 'Drill — Rhyme → Char',
  drill2Prompt: (r) => `Which 4 belong to ${r}?`,
  drill2Picked: (n) => `Selected ${n} / 4`,
  drill2Submit: 'Submit',
  drill2Next: 'Next',
  drill2Correct: (n) => `Correct ${n} / 4`,

  drill3SessionTitle: 'Drill — Discrimination',
  drill3PromptRhyme: 'Do these two chars rhyme?',

  drill3AnswerYes: 'They rhyme',
  drill3AnswerNo: "Don't rhyme",
  drill3CorrectAnswer: 'Correct answer',
  drill3TeachingNote: 'Teaching note',
  drill3Mnemonic: 'Mnemonic',
  drill3AnchorPoem: 'Anchor poem',
  drill3Continue: 'Continue',

  drillSessionTitle: 'Drill — Char → Rhyme',
  drillPromptCharToRhyme: 'Which rhyme does this belong to?',
  drillStats: (drilled, total) => `Drilled ${drilled} / ${total}`,
  drillContinueNext: 'Next',
  drillExplanation: (char, rhyme) => `${char} belongs to ${rhyme}`,
  drillSummaryTitle: 'Session complete',
  drillSummaryStats: (correct, total) => `${correct} correct out of ${total}`,
  drillPickCount5: '5 cards',
  drillPickCount10: '10 cards',
  drillPickCount20: '20 cards',
  drillPickCountAll: 'All',
  drillHintLabel: 'Hint:',
  drillHintOn: 'On',
  drillHintOff: 'Off',
  drillHintShow: 'Show hints',
  drillHintHide: 'Hide hints',

  drillCorrect: 'Correct',
  drillIncorrect: 'Not quite',
  drillShowAnswer: 'Show answer',
  gradeAgain: 'Again',
  gradeHard: 'Hard',
  gradeGood: 'Good',
  gradeEasy: 'Easy',
  gradeAgainHint: 'Forgot completely',
  gradeHardHint: 'Took a while',
  gradeGoodHint: 'Some hesitation',
  gradeEasyHint: 'Effortless',
  noCardsDueTitle: 'No reviews due',
  noCardsDueBody: 'Come back tomorrow, or learn a new 韵部.',

  dashboardTitle: 'Your progress',
  masteryLegendNotStarted: 'Not started',
  masteryLegendIntroduced: 'Introduced',
  masteryLegendLearning: 'Learning',
  masteryLegendReview: 'Reviewing',
  masteryLegendMastered: 'Mastered',

  loading: 'Loading…',
  errorGeneric: 'Something went wrong. Try again.',
  retry: 'Retry',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const STRINGS: Record<Locale, TrainerStrings> = {
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  'en-bilingual': enBilingual,
};

export const getStrings = (locale: Locale): TrainerStrings =>
  STRINGS[locale] ?? zhHans;
