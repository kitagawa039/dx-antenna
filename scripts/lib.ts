// 収集ロジックの純粋関数群（テスト対象）
import { createHash } from "node:crypto";
import type { FeedItem, ItemType } from "../src/types";

/** キーワードフィルタ・タグ付けに使うキーワード一覧（順序がタグの優先順） */
export const KEYWORDS = [
  "生成AI",
  "AI",
  "LLM",
  "DX",
  "Copilot",
  "ChatGPT",
  "Claude",
  "Gemini",
  "エージェント",
  "自動化",
  "RPA",
  "データ活用",
  "機械学習",
] as const;

/** カテゴリ分類（event判定）に使うキーワード一覧 */
export const EVENT_KEYWORDS = [
  "展示会",
  "EXPO",
  "セミナー",
  "ウェビナー",
  "カンファレンス",
  "開催",
  "来場",
] as const;

/** タイトルがキーワードを含むか（英字は大文字小文字を区別しない） */
function includesIgnoreCase(title: string, keyword: string): boolean {
  return title.toLowerCase().includes(keyword.toLowerCase());
}

/** 汎用フィード向けキーワードフィルタ。いずれかのキーワードを含めば採用 */
export function matchesKeywordFilter(title: string): boolean {
  return KEYWORDS.some((k) => includesIgnoreCase(title, k));
}

/** タイトルからカテゴリを判定する。イベント系キーワードを含めば event */
export function classify(title: string): ItemType {
  return EVENT_KEYWORDS.some((k) => includesIgnoreCase(title, k)) ? "event" : "news";
}

/**
 * タイトルから日付らしき文字列を抽出する（例: 7月8日、2026/10/21、2026年10月21日）。
 * 抽出できなければ undefined（無理に推定しない）
 */
export function extractEventDate(title: string): string | undefined {
  const patterns = [
    /\d{4}年\d{1,2}月\d{1,2}日/, // 2026年10月21日
    /\d{4}\/\d{1,2}\/\d{1,2}/, // 2026/10/21
    /\d{1,2}月\d{1,2}日/, // 7月8日
  ];
  for (const p of patterns) {
    const m = title.match(p);
    if (m) return m[0];
  }
  return undefined;
}

/**
 * タイトルに含まれるキーワードを最大3つ返す。
 * 別の一致キーワードに包含されるもの（例: 「生成AI」一致時の「AI」）は除外する
 */
export function extractTags(title: string): string[] {
  const matched = KEYWORDS.filter((k) => includesIgnoreCase(title, k));
  const filtered = matched.filter(
    (k) => !matched.some((other) => other !== k && other.toLowerCase().includes(k.toLowerCase()))
  );
  return filtered.slice(0, 3);
}

/** URLを正規化する（クエリパラメータ・フラグメント除去）。不正なURLはそのまま返す */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

/** URLのsha1ハッシュ先頭12桁をIDとする */
export function makeId(url: string): string {
  return createHash("sha1").update(url).digest("hex").slice(0, 12);
}

/** Google News経由のアイテムか（タイトル類似重複の優先判定に使用） */
function isAggregator(item: FeedItem): boolean {
  return item.source === "Google News";
}

/**
 * 重複排除。
 * 1. 正規化URLの完全一致
 * 2. タイトル前方30文字一致（Google Newsと元メディアの二重取得対策。元メディア側を優先）
 */
export function dedupe(items: FeedItem[]): FeedItem[] {
  // URL完全一致の排除（先勝ち。呼び出し側で新しい順に並べておく）
  const byUrl = new Map<string, FeedItem>();
  for (const item of items) {
    const key = normalizeUrl(item.url);
    if (!byUrl.has(key)) byUrl.set(key, item);
  }

  // タイトル前方30文字一致の排除（元メディア優先）
  const byTitle = new Map<string, FeedItem>();
  for (const item of byUrl.values()) {
    const key = item.title.slice(0, 30);
    const existing = byTitle.get(key);
    if (!existing) {
      byTitle.set(key, item);
    } else if (isAggregator(existing) && !isAggregator(item)) {
      byTitle.set(key, item);
    }
  }
  return [...byTitle.values()];
}

/**
 * NEW判定。前回data.jsonに存在しないURLの記事を isNew: true にする。
 * 前回データがない（初回実行）場合は全件false
 */
export function markNew(items: FeedItem[], prevUrls: Set<string> | null): FeedItem[] {
  return items.map((item) => ({
    ...item,
    isNew: prevUrls !== null && !prevUrls.has(normalizeUrl(item.url)),
  }));
}

/** 公開日が基準日時から7日より古い記事を除外する */
export function withinDays(publishedAt: string, now: Date, days = 7): boolean {
  const t = Date.parse(publishedAt);
  if (Number.isNaN(t)) return false;
  return now.getTime() - t <= days * 24 * 60 * 60 * 1000;
}

/** 日時をJST（+09:00）のISO 8601文字列にする */
export function toJstIso(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(jst.getUTCDate())}` +
    `T${pad(jst.getUTCHours())}:${pad(jst.getUTCMinutes())}:${pad(jst.getUTCSeconds())}+09:00`
  );
}
