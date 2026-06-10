// ダイジェストパネル用の集計純粋関数群
import type { FeedItem } from "./types";

/** タグの出現回数を集計し、上位を返す */
export function topKeywords(items: FeedItem[], limit = 5): { keyword: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword, "ja"))
    .slice(0, limit);
}

/**
 * eventDate文字列（例: 7月9日、2026/10/21、2026年10月21日）をタイムスタンプに変換する。
 * 年がない場合は基準日の年とみなし、60日以上過去なら翌年と解釈する。
 * 解釈できなければ null
 */
export function parseEventDate(eventDate: string, now: Date): number | null {
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  let m = eventDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/) ?? eventDate.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) {
    [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  } else {
    m = eventDate.match(/(\d{1,2})月(\d{1,2})日/);
    if (m) [month, day] = [Number(m[1]), Number(m[2])];
  }
  if (month === null || day === null || month < 1 || month > 12 || day < 1 || day > 31) return null;

  if (year === null) {
    year = now.getFullYear();
    const t = new Date(year, month - 1, day).getTime();
    // 年なし表記が大きく過去になる場合は翌年開催とみなす
    if (now.getTime() - t > 60 * 24 * 60 * 60 * 1000) year += 1;
  }
  return new Date(year, month - 1, day).getTime();
}

/** 開催日が抽出できたイベントを開催日の近い順に返す（昨日以前は除外） */
export function upcomingEvents(items: FeedItem[], now: Date, limit = 3): FeedItem[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return items
    .filter((i) => i.type === "event" && i.eventDate)
    .map((i) => ({ item: i, t: parseEventDate(i.eventDate!, now) }))
    .filter((x): x is { item: FeedItem; t: number } => x.t !== null && x.t >= startOfToday)
    .sort((a, b) => a.t - b.t)
    .slice(0, limit)
    .map((x) => x.item);
}

/** ヘッドライン: NEWのニュースを優先し、足りなければ新しいニュースで補って返す */
export function headlines(items: FeedItem[], limit = 3): FeedItem[] {
  const news = items.filter((i) => i.type === "news");
  const picked = [...news.filter((i) => i.isNew), ...news.filter((i) => !i.isNew)];
  return picked.slice(0, limit);
}
