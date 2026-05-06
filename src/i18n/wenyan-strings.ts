export const wenyanStrings = {
  cn: {
    moduleTitle: '文言教材',
    moduleSubtitle: '管理员预览',
    backToHome: '← 返回',
    stagePlaceholder: 'Stage A 仅含底层结构。诗歌列表将在 Stage B 上线。',
  },
  en: {
    moduleTitle: 'Classical Chinese Reader',
    moduleSubtitle: 'Admin preview',
    backToHome: '← Back',
    stagePlaceholder: 'Stage A foundation only. Poem list arrives in Stage B.',
  },
} as const;

export type WenyanLang = keyof typeof wenyanStrings;
