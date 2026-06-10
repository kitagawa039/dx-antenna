// RSS収集スクリプト。public/data.json を生成する
// 実行: npm run collect
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import type { CollectedData, FeedItem } from "../src/types";
import {
  classify,
  dedupe,
  extractEventDate,
  extractTags,
  makeId,
  markNew,
  matchesKeywordFilter,
  normalizeUrl,
  toJstIso,
  withinDays,
} from "./lib";

/** 収集ソース定義。追加・削除はこの配列だけを編集する */
interface Source {
  name: string;
  url: string;
  /** trueなら汎用フィードとしてキーワードフィルタを適用する */
  requireKeyword: boolean;
}

const googleNews = (query: string): string =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;

const SOURCES: Source[] = [
  // ニュース系RSS（専門フィードはフィルタなし、汎用フィードはフィルタあり）
  { name: "ITmedia AI+", url: "https://rss.itmedia.co.jp/rss/2.0/aiplus.xml", requireKeyword: false },
  { name: "ITmedia エンタープライズ", url: "https://rss.itmedia.co.jp/rss/2.0/enterprise.xml", requireKeyword: true },
  { name: "Publickey", url: "https://www.publickey1.jp/atom.xml", requireKeyword: true },
  { name: "ASCII.jp", url: "https://ascii.jp/rss.xml", requireKeyword: true },
  // 要件記載の /rss/index.rdf は404のため公式フィードに差し替え（2026-06-10確認）
  { name: "ZDNet Japan", url: "https://feeds.japan.zdnet.com/rss/zdnet/all.rdf", requireKeyword: true },
  // Google News検索RSS（クエリ自体が絞り込みなのでフィルタなし）
  { name: "Google News", url: googleNews("生成AI 企業"), requireKeyword: false },
  { name: "Google News", url: googleNews("DX推進"), requireKeyword: false },
  { name: "Google News", url: googleNews("AI 展示会"), requireKeyword: false },
  { name: "Google News", url: googleNews("AI セミナー 開催"), requireKeyword: false },
  { name: "Google News", url: googleNews("DX EXPO"), requireKeyword: false },
];

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(rootDir, "public", "data.json");

/** 前回のdata.jsonからURL集合を読み込む（初回はnull） */
function loadPrevUrls(): Set<string> | null {
  try {
    const prev = JSON.parse(readFileSync(dataPath, "utf-8")) as CollectedData;
    return new Set(prev.items.map((i) => normalizeUrl(i.url)));
  } catch {
    return null;
  }
}

/** 1フィードを取得してFeedItemに変換する（isNewは後段で付与） */
async function fetchSource(parser: Parser, source: Source, now: Date): Promise<FeedItem[]> {
  const feed = await parser.parseURL(source.url);
  const items: FeedItem[] = [];
  for (const entry of feed.items ?? []) {
    const title = entry.title?.trim();
    const url = entry.link;
    const publishedAt = entry.isoDate ?? entry.pubDate;
    if (!title || !url || !publishedAt) continue;
    if (!withinDays(publishedAt, now)) continue;
    if (source.requireKeyword && !matchesKeywordFilter(title)) continue;

    const type = classify(title);
    const item: FeedItem = {
      id: makeId(normalizeUrl(url)),
      type,
      title,
      url,
      source: source.name,
      publishedAt: toJstIso(new Date(publishedAt)),
      isNew: false,
      tags: extractTags(title),
      place: null,
    };
    if (type === "event") {
      const eventDate = extractEventDate(title);
      if (eventDate) item.eventDate = eventDate;
    }
    items.push(item);
  }
  return items;
}

async function main(): Promise<void> {
  const now = new Date();
  const parser = new Parser({ timeout: 15000 });
  const collected: FeedItem[] = [];
  let successCount = 0;

  // フィード単位でtry-catch。1ソースの失敗で全体を落とさない
  for (const source of SOURCES) {
    try {
      const items = await fetchSource(parser, source, now);
      collected.push(...items);
      successCount++;
      console.log(`✓ ${source.name}: ${items.length}件 (${source.url})`);
    } catch (err) {
      console.error(`✗ ${source.name} の取得に失敗したためスキップ: ${source.url}`);
      console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 全ソース失敗時のみ非ゼロ終了（既存data.jsonを保護）
  if (successCount === 0) {
    console.error("全ソースの取得に失敗しました。data.jsonは更新しません。");
    process.exit(1);
  }

  // 新しい順に整列 → 重複排除 → 100件制限 → NEW判定
  collected.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const deduped = dedupe(collected).slice(0, 100);
  const prevUrls = loadPrevUrls();
  const items = markNew(deduped, prevUrls);

  const data: CollectedData = {
    updatedAt: toJstIso(now),
    sourceCount: successCount,
    items,
  };

  mkdirSync(dirname(dataPath), { recursive: true });
  writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`完了: ${items.length}件（NEW ${items.filter((i) => i.isNew).length}件、${successCount}/${SOURCES.length}ソース成功）`);
}

main().catch((err) => {
  console.error("収集処理で予期しないエラーが発生しました:", err);
  process.exit(1);
});
