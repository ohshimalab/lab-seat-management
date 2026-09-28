export interface AnniversaryItem {
  id: string;
  title: string;
  category: "culture" | "tech" | "food" | "season" | "lab" | "general";
  description: string;
  emoji: string;
  originYear?: number;
  isCustom?: boolean;
}

export const FIXED_ANNIVERSARIES: Record<string, AnniversaryItem[]> = {
  "01-01": [
    { id: "new-year", title: "元日 (New Year's Day)", category: "season", description: "新しい年の始まりを祝う国民の祝日。", emoji: "🎍" },
    { id: "iron-atom", title: "鉄腕アトムの日", category: "culture", description: "1963年、日本初の連続TVアニメ『鉄腕アトム』が放送開始。", emoji: "🤖", originYear: 1963 },
  ],
  "01-15": [
    { id: "strawberry", title: "いい苺の日", category: "food", description: "「いい(1)いち(1)ご(5)」の語呂合わせ。", emoji: "🍓" },
    { id: "wikipedia", title: "ウィキペディアの日", category: "tech", description: "2001年、インターネット百科事典Wikipediaが公開されました。", emoji: "🌐", originYear: 2001 },
  ],
  "02-14": [
    { id: "valentine", title: "バレンタインデー", category: "culture", description: "大切な人やお世話になっている人に気持ちやチョコを伝える日。", emoji: "🍫" },
    { id: "eniac", title: "世界初の汎用電子計算機 ENIAC公開", category: "tech", description: "1946年、ペンシルベニア大学でENIACが発表されました。", emoji: "💻", originYear: 1946 },
  ],
  "02-22": [
    { id: "cat-day", title: "猫の日", category: "culture", description: "「ニャン(2)ニャン(2)ニャン(2)」の語呂合わせ。", emoji: "🐱" },
    { id: "ninja-day", title: "忍者の日", category: "culture", description: "「ニン(2)ニン(2)ニン(2)」の語呂合わせ。", emoji: "🥷" },
  ],
  "03-03": [
    { id: "hinamatsuri", title: "ひな祭り (桃の節句)", category: "season", description: "春の訪れとともに健康と成長を願う日本の伝統行事。", emoji: "🎎" },
    { id: "ear-day", title: "耳の日", category: "general", description: "「み(3)み(3)」の語呂合わせ。", emoji: "👂" },
  ],
  "03-14": [
    { id: "pi-day", title: "円周率の日 (π Day)", category: "tech", description: "円周率の近似値 3.14 にちなんだ記念日。", emoji: "🥧" },
    { id: "white-day", title: "ホワイトデー", category: "culture", description: "バレンタインのお返しや感謝を伝える日。", emoji: "🍬" },
  ],
  "04-01": [
    { id: "april-fools", title: "エイプリルフール", category: "culture", description: "罪のない嘘をついて楽しむ風習の日。", emoji: "🃏" },
    { id: "apple-founding", title: "Apple 創業記念日", category: "tech", description: "1976年、スティーブ・ジョブズとウォズニアックらが設立。", emoji: "🍏", originYear: 1976 },
  ],
  "04-22": [
    { id: "earth-day", title: "アースデイ (地球の日)", category: "general", description: "地球環境について考え行動する国際的な日。", emoji: "🌍" },
  ],
  "05-04": [
    { id: "star-wars", title: "スター・ウォーズの日", category: "culture", description: "「May the Force be with you」と「May the 4th」をかけた日。", emoji: "⚔️" },
    { id: "greenery-day", title: "みどりの日", category: "season", description: "自然に親しむとともにその恩恵に感謝し、豊かな心をはぐくむ祝日。", emoji: "🌿" },
  ],
  "05-17": [
    { id: "world-telecom", title: "世界情報社会・電気通信日", category: "tech", description: "1865年の万国電信連合発足にちなんだ国際デー。", emoji: "📡", originYear: 1865 },
  ],
  "06-01": [
    { id: "photo-day", title: "写真の日", category: "culture", description: "1841年に日本人が初めて写真撮影を行ったとされる日。", emoji: "📷", originYear: 1841 },
    { id: "weather-day", title: "気象記念日", category: "tech", description: "1875年、東京気象台で気象と地震の観測が開始されました。", emoji: "☀️", originYear: 1875 },
  ],
  "07-07": [
    { id: "tanabata", title: "七夕 (笹の節句)", category: "season", description: "短冊に願いを込めて笹に飾る五節句の一つ。", emoji: "🎋" },
    { id: "yukata-day", title: "ゆかたの日", category: "culture", description: "七夕の夜に浴衣を着て涼む風習にちなむ記念日。", emoji: "👘" },
  ],
  "07-20": [
    { id: "apollo11", title: "月面着陸の日", category: "tech", description: "1969年、アポロ11号が人類初の月面着陸を達成。", emoji: "🌕", originYear: 1969 },
  ],
  "08-08": [
    { id: "infinity-day", title: "パパの日 / そろばんの日", category: "general", description: "数字の8が並ぶ吉日、そろばんの弾く音にちなむ。", emoji: "🧮" },
  ],
  "08-11": [
    { id: "mountain-day", title: "山の日", category: "season", description: "山に親しむ機会を得て、山の恩恵に感謝する祝日。", emoji: "⛰️" },
  ],
  "09-03": [
    { id: "doraemon", title: "ドラえもんの誕生日", category: "culture", description: "2112年9月3日、未来のネコ型ロボットが誕生する設定。", emoji: "🔔", originYear: 2112 },
  ],
  "09-12": [
    { id: "space-day", title: "宇宙の日", category: "tech", description: "1992年の毛利衛宇宙飛行士がスペースシャトルで宇宙へ飛び立った日。", emoji: "🚀", originYear: 1992 },
    { id: "programmer-day-leap", title: "プログラマーの日 (平年)", category: "tech", description: "年の始めから256日目 (2^8)。平年は9月13日、閏年は9月12日。", emoji: "💻" },
  ],
  "09-13": [
    { id: "programmer-day", title: "プログラマーの日", category: "tech", description: "1年の第256日目 (2^8)。多くの国でプログラマーを祝う日。", emoji: "💻" },
  ],
  "09-28": [
    { id: "pc-day", title: "パソコン記念日", category: "tech", description: "1979年9月28日、NECが日本のPC黎明期を築いたPC-8001を発売した日。", emoji: "🖥️", originYear: 1979 },
    { id: "privacy-day", title: "国際アクセストゥインフォメーション・デー", category: "general", description: "UNESCOが定めた情報アクセスと知る権利の国際記念日。", emoji: "📖" },
  ],
  "10-01": [
    { id: "coffee-day", title: "国際コーヒーの日", category: "food", description: "コーヒーの新年度が始まる10月に美味しいコーヒーを讃える日。", emoji: "☕" },
    { id: "design-day", title: "デザインの日", category: "culture", description: "日本のデザイン振興とクリエイティビティを祝う日。", emoji: "🎨" },
  ],
  "10-10": [
    { id: "sports-health", title: "目の愛護デー / 缶詰の日", category: "general", description: "10 10を横に倒すと目と眉に見えることから目の健康を考える日。", emoji: "👁️" },
  ],
  "10-29": [
    { id: "internet-day", title: "インターネット誕生日", category: "tech", description: "1969年、ARPANETで初のコンピュータ間通信が行われた日。", emoji: "🌐", originYear: 1969 },
  ],
  "11-03": [
    { id: "culture-day", title: "文化の日", category: "culture", description: "自由と平和を愛し、文化をすすめる国民の祝日。", emoji: "🍁" },
  ],
  "11-11": [
    { id: "pocky-day", title: "ポッキー＆プリッツの日", category: "food", description: "数字の1がスティック状のお菓子に似ていることから親しまれる日。", emoji: "🥢" },
    { id: "origami-day", title: "おりがみの日", category: "culture", description: "世界平和を願う折り鶴と、1が4つ並ぶ正方形の4辺に見立てた記念日。", emoji: "🕊️" },
  ],
  "11-23": [
    { id: "kinrou", title: "勤労感謝の日", category: "season", description: "勤労を尊び、生産を祝い、国民が互いに感謝し合う祝日。", emoji: "🌾" },
    { id: "game-day", title: "ゲームの日", category: "culture", description: "仕事や勉強の合間にゲームを通じて家族や仲間と楽しむ日。", emoji: "🎮" },
  ],
  "12-24": [
    { id: "christmas-eve", title: "クリスマスイブ", category: "season", description: "キリスト降誕の前夜祭。研究室でもケーキやお菓子を楽しもう！", emoji: "🎄" },
  ],
  "12-25": [
    { id: "christmas", title: "クリスマス", category: "season", description: "世界中で喜びと平和を祝う日。", emoji: "🎅" },
  ],
  "12-31": [
    { id: "omisoka", title: "大晦日", category: "season", description: "1年の最後の日。今年1年の研究や活動を振り返る日。", emoji: "🔔" },
  ],
};

const CUSTOM_ANNIVERSARIES_KEY = "lab.customAnniversaries";

export const getCustomAnniversaries = (): Record<string, AnniversaryItem[]> => {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(CUSTOM_ANNIVERSARIES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const saveCustomAnniversary = (dateKey: string, item: Omit<AnniversaryItem, "id" | "isCustom">): AnniversaryItem => {
  const customMap = getCustomAnniversaries();
  const newItem: AnniversaryItem = {
    ...item,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isCustom: true,
  };
  const list = customMap[dateKey] ? [...customMap[dateKey]] : [];
  list.push(newItem);
  customMap[dateKey] = list;
  try {
    localStorage.setItem(CUSTOM_ANNIVERSARIES_KEY, JSON.stringify(customMap));
  } catch (err) {
    console.error("Failed to save custom anniversary", err);
  }
  return newItem;
};

export const deleteCustomAnniversary = (dateKey: string, id: string): void => {
  const customMap = getCustomAnniversaries();
  if (!customMap[dateKey]) return;
  customMap[dateKey] = customMap[dateKey].filter((i) => i.id !== id);
  try {
    localStorage.setItem(CUSTOM_ANNIVERSARIES_KEY, JSON.stringify(customMap));
  } catch (err) {
    console.error("Failed to delete custom anniversary", err);
  }
};

export const formatDateKey = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
};

export const getAnniversariesForDate = (date: Date): AnniversaryItem[] => {
  const dateKey = formatDateKey(date);
  const fixed = FIXED_ANNIVERSARIES[dateKey] || [];
  const customMap = getCustomAnniversaries();
  const custom = customMap[dateKey] || [];

  return [...custom, ...fixed];
};

const pickEmojiForTitle = (title: string, desc: string): string => {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("猫") || text.includes("ねこ")) return "🐱";
  if (text.includes("犬") || text.includes("いぬ")) return "🐶";
  if (text.includes("pc") || text.includes("パソコン") || text.includes("コンピュータ") || text.includes("プログラ")) return "💻";
  if (text.includes("宇宙") || text.includes("ロケット") || text.includes("シャトル")) return "🚀";
  if (text.includes("本") || text.includes("読書") || text.includes("図書")) return "📚";
  if (text.includes("音楽") || text.includes("歌") || text.includes("ピアノ")) return "🎵";
  if (text.includes("食") || text.includes("パン") || text.includes("米") || text.includes("カレー") || text.includes("肉")) return "🍴";
  if (text.includes("コーヒー") || text.includes("カフェ") || text.includes("茶")) return "☕";
  if (text.includes("酒") || text.includes("ビール") || text.includes("ワイン")) return "🍺";
  if (text.includes("花") || text.includes("桜") || text.includes("緑") || text.includes("山")) return "🌿";
  if (text.includes("鉄道") || text.includes("電車") || text.includes("駅")) return "🚃";
  if (text.includes("海") || text.includes("水") || text.includes("川")) return "🌊";
  if (text.includes("愛") || text.includes("ハート") || text.includes("感謝")) return "❤️";
  if (text.includes("スポーツ") || text.includes("オリンピック") || text.includes("野球") || text.includes("サッカー")) return "⚽";
  return "🎌";
};

const wikiCache: Record<string, AnniversaryItem[]> = {};

export const fetchWikiAnniversaries = async (
  month: number,
  day: number,
): Promise<AnniversaryItem[]> => {
  const dateKey = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (wikiCache[dateKey]) {
    return wikiCache[dateKey];
  }

  // Check localStorage cache
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cached = localStorage.getItem(`wiki_anniv_${dateKey}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          wikiCache[dateKey] = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage error
    }
  }

  try {
    const pageName = `${month}月${day}日`;
    const url = new URL("https://ja.wikipedia.org/w/api.php");
    url.search = new URLSearchParams({
      action: "parse",
      page: pageName,
      prop: "wikitext",
      format: "json",
      origin: "*",
    }).toString();

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    const text = data?.parse?.wikitext?.["*"];
    if (!text) return [];

    const startIdx = text.indexOf("== 記念日・年中行事 ==");
    if (startIdx === -1) return [];

    const after = text.slice(startIdx + "== 記念日・年中行事 ==".length);
    const nextSectionMatch = after.search(/\n==[^=]/);
    const section = nextSectionMatch !== -1 ? after.slice(0, nextSectionMatch) : after;

    const items: AnniversaryItem[] = [];
    const lines = section.split("\n");
    let current: { title: string; description: string } | null = null;

    const cleanText = (str: string) => {
      return str
        .replace(/<ref[\s\S]*?(?:<\/ref>|\/>)/gi, "")
        .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/'''?/g, "")
        .replace(/（\s*）|\(\s*\)/g, "")
        .trim();
    };

    const isAnniversaryLike = (title: string) => {
      return /日|デー|day|記念|節句|祭/i.test(title);
    };

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith("*") && !line.startsWith("*:")) {
        if (current && current.title && isAnniversaryLike(current.title)) {
          items.push({
            id: `wiki-${dateKey}-${items.length}`,
            title: current.title,
            category: "general",
            description: current.description,
            emoji: pickEmojiForTitle(current.title, current.description),
          });
        }
        const rawTitle = cleanText(line.replace(/^\*+\s*/, ""));
        if (rawTitle && isAnniversaryLike(rawTitle)) {
          current = {
            title: rawTitle,
            description: "",
          };
        } else {
          current = null;
        }
      } else if (line.startsWith("*:") && current) {
        const desc = cleanText(line.replace(/^\*+:\s*/, ""));
        if (desc) {
          current.description += (current.description ? " " : "") + desc;
        }
      }
    }
    if (current && current.title && isAnniversaryLike(current.title)) {
      items.push({
        id: `wiki-${dateKey}-${items.length}`,
        title: current.title,
        category: "general",
        description: current.description,
        emoji: pickEmojiForTitle(current.title, current.description),
      });
    }

    if (items.length > 0) {
      wikiCache[dateKey] = items;
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem(`wiki_anniv_${dateKey}`, JSON.stringify(items));
        } catch {
          // Ignore storage quota
        }
      }
    }
    return items;
  } catch (err) {
    console.error("Failed to fetch Wikipedia anniversaries", err);
    return [];
  }
};

