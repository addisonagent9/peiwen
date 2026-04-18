export type ReadingNote = {
  rhyme: string;
  note_zh_tw: string;
  note_zh_cn: string;
  status: "attested" | "retained_legacy";
};

export interface AmbiguousReading {
  note_zh_tw?: string;
  note_zh_cn?: string;
  per_reading_notes?: ReadingNote[];
}

export const AMBIGUOUS_READINGS: Record<string, AmbiguousReading> = {
  "茍": {
    note_zh_tw: "「茍」與「苟」易混；依康熙字典本字讀入聲。多部外來字典將其歸入「二十五有」（苟字之韻）。",
    note_zh_cn: "「茍」与「苟」易混；依康熙字典本字读入声。多部外来字典将其归入「二十五有」（苟字之韵）。"
  },
  "妳": {
    note_zh_tw: "現代作「女性你」用時多讀 nǐ（四紙）；古籍「乃也切」在九蟹。",
    note_zh_cn: "现代作「女性你」用时多读 nǐ（四纸）；古籍「乃也切」在九蟹。"
  },
  "圯": {
    note_zh_tw: "多音字：平聲 yí（如「圯橋」）與上聲 yǐ 皆有據。",
    note_zh_cn: "多音字：平声 yí（如「圯桥」）与上声 yǐ 皆有据。"
  },
  "晁": {
    note_zh_tw: "晁多作姓氏讀 cháo（平聲），部分字典另收仄聲讀法。",
    note_zh_cn: "晁多作姓氏读 cháo（平声），部分字典另收仄声读法。"
  },
  "婧": {
    note_zh_tw: "康熙字典收「子正切」（去聲敬）與「子郢切」（上聲梗）二讀。",
    note_zh_cn: "康熙字典收「子正切」（去声敬）与「子郢切」（上声梗）二读。"
  },
  "拼": {
    note_zh_tw: "現代 pīn 在平水韻中無完全對應韻部；各字典歸類不一。",
    note_zh_cn: "现代 pīn 在平水韵中无完全对应韵部；各字典归类不一。"
  },
  "暖": {
    note_zh_tw: "「暖」主要讀音為上聲（nuǎn，溫暖），在平水韻歸於十四旱或十三阮；另可作「曖」之異體，讀去聲十一隊（ài，昏暗不明）。",
    note_zh_cn: "「暖」主要读音为上声（nuǎn，温暖），在平水韵归于十四旱或十三阮；另可作「暧」之异体，读去声十一队（ài，昏暗不明）。"
  },
  "柿": {
    note_zh_tw: "康熙字典「士史切」（上聲紙）與另作去聲隊讀並存。",
    note_zh_cn: "康熙字典「士史切」（上声纸）与另作去声队读并存。"
  },
  "嚙": {
    per_reading_notes: [
      {
        rhyme: "九屑",
        status: "attested",
        note_zh_tw: "依康熙字典、廣韻，「嚙」正讀入聲九屑（niè）。",
        note_zh_cn: "依康熙字典、广韵，「啮」正读入声九屑（niè）。"
      },
      {
        rhyme: "十八巧",
        status: "retained_legacy",
        note_zh_tw: "十八巧之讀音未見於權威字典，為本系統保留之舊條目，僅供參考。",
        note_zh_cn: "十八巧之读音未见于权威字典，为本系统保留之旧条目，仅供参考。"
      }
    ]
  },
  "徘": {
    per_reading_notes: [
      {
        rhyme: "十灰",
        status: "attested",
        note_zh_tw: "依外部字典共識，「徘」歸於平聲十灰（pái，如「徘徊」）。",
        note_zh_cn: "依外部字典共识，「徘」归于平声十灰（pái，如「徘徊」）。"
      },
      {
        rhyme: "九佳",
        status: "retained_legacy",
        note_zh_tw: "九佳之歸類未見於多數字典，為本系統保留之舊條目，僅供參考。",
        note_zh_cn: "九佳之归类未见于多数字典，为本系统保留之旧条目，仅供参考。"
      }
    ]
  },
  "濫": {
    per_reading_notes: [
      {
        rhyme: "二十八勘",
        status: "attested",
        note_zh_tw: "依外部字典，「濫」去聲讀為二十八勘（làn）。",
        note_zh_cn: "依外部字典，「滥」去声读为二十八勘（làn）。"
      },
      {
        rhyme: "二十七感",
        status: "attested",
        note_zh_tw: "部分字典收二十七感讀法。",
        note_zh_cn: "部分字典收二十七感读法。"
      },
      {
        rhyme: "二十九豏",
        status: "retained_legacy",
        note_zh_tw: "二十九豏之歸類未見於外部字典，為本系統保留之舊條目。",
        note_zh_cn: "二十九豏之归类未见于外部字典，为本系统保留之旧条目。"
      }
    ]
  },
  "臒": {
    per_reading_notes: [
      {
        rhyme: "七虞",
        status: "attested",
        note_zh_tw: "「臒」為「臞」之異體，讀平聲七虞（qú，瘦也）。",
        note_zh_cn: "「臒」为「臞」之异体，读平声七虞（qú，瘦也）。"
      },
      {
        rhyme: "十藥",
        status: "attested",
        note_zh_tw: "入聲十藥之讀法見於原始資料及外部字典（jkak），為次要讀音。",
        note_zh_cn: "入声十药之读法见于原始资料及外部字典（jkak），为次要读音。"
      }
    ]
  }
};
