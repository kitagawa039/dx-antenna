// 収集ロジック純粋関数のテスト
import { describe, expect, it } from "vitest";
import type { FeedItem } from "../src/types";
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

/** テスト用FeedItemを生成するヘルパー */
function item(over: Partial<FeedItem>): FeedItem {
  return {
    id: "x",
    type: "news",
    title: "タイトル",
    url: "https://example.com/a",
    source: "テスト",
    publishedAt: "2026-06-10T07:00:00+09:00",
    isNew: false,
    tags: [],
    place: null,
    ...over,
  };
}

describe("matchesKeywordFilter（キーワードフィルタ）", () => {
  it("キーワードを含むタイトルは採用する", () => {
    expect(matchesKeywordFilter("生成AIの企業導入が加速")).toBe(true);
    expect(matchesKeywordFilter("DX推進の現在地")).toBe(true);
    expect(matchesKeywordFilter("RPAから自律エージェントへ")).toBe(true);
  });

  it("英字キーワードは大文字小文字を区別しない", () => {
    expect(matchesKeywordFilter("copilotの新機能")).toBe(true);
    expect(matchesKeywordFilter("chatgptを使った業務改善")).toBe(true);
  });

  it("キーワードを含まないタイトルは除外する", () => {
    expect(matchesKeywordFilter("新型スマートフォンが発売")).toBe(false);
  });
});

describe("classify（カテゴリ分類）", () => {
  it("イベント系キーワードを含むと event", () => {
    expect(classify("AI博覧会 Summer 2026 専門展示会")).toBe("event");
    expect(classify("生成AI活用セミナーのご案内")).toBe("event");
    expect(classify("DX EXPO 2026 来場登録開始")).toBe("event");
    expect(classify("Japan IT Week 開催決定")).toBe("event");
  });

  it("EXPOは小文字（Expo）でも event と判定する", () => {
    expect(classify("AI Expo Tokyo 2026")).toBe("event");
  });

  it("イベント系キーワードがなければ news", () => {
    expect(classify("経産省、生成AI活用ガイドライン第3版を公開")).toBe("news");
  });
});

describe("extractEventDate（開催日抽出）", () => {
  it("「7月8日」形式を抽出する", () => {
    expect(extractEventDate("セミナー 7月8日開催")).toBe("7月8日");
  });

  it("「2026/10/21」形式を抽出する", () => {
    expect(extractEventDate("展示会(2026/10/21)のお知らせ")).toBe("2026/10/21");
  });

  it("「2026年10月21日」形式を抽出する", () => {
    expect(extractEventDate("2026年10月21日に開幕")).toBe("2026年10月21日");
  });

  it("日付がなければ undefined（無理に推定しない）", () => {
    expect(extractEventDate("AIセミナー開催決定")).toBeUndefined();
  });
});

describe("extractTags（タグ付け）", () => {
  it("タイトルに含まれるキーワードを返す", () => {
    expect(extractTags("ChatGPTとClaudeの比較")).toEqual(["ChatGPT", "Claude"]);
  });

  it("最大3つまでに制限する", () => {
    expect(extractTags("LLM・DX・RPA・機械学習のすべて")).toHaveLength(3);
  });

  it("「生成AI」一致時は包含される「AI」を除外する", () => {
    expect(extractTags("生成AIで業務効率化")).toEqual(["生成AI"]);
  });
});

describe("normalizeUrl（URL正規化）", () => {
  it("クエリパラメータを除去する", () => {
    expect(normalizeUrl("https://example.com/news/1?utm_source=rss&ref=top")).toBe(
      "https://example.com/news/1"
    );
  });

  it("フラグメントを除去する", () => {
    expect(normalizeUrl("https://example.com/news/1#section")).toBe("https://example.com/news/1");
  });

  it("不正なURLはそのまま返す", () => {
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
  });
});

describe("makeId（ID生成）", () => {
  it("sha1ハッシュ先頭12桁を返す", () => {
    const id = makeId("https://example.com/a");
    expect(id).toMatch(/^[0-9a-f]{12}$/);
    expect(makeId("https://example.com/a")).toBe(id); // 同一URLは同一ID
    expect(makeId("https://example.com/b")).not.toBe(id);
  });
});

describe("dedupe（重複排除）", () => {
  it("正規化URLが同じ記事は先勝ちで1件にする", () => {
    const a = item({ url: "https://example.com/a?utm=1", title: "記事A" });
    const b = item({ url: "https://example.com/a", title: "記事A(重複)" });
    const result = dedupe([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("記事A");
  });

  it("タイトル前方30文字一致は元メディア側を優先する", () => {
    const long = "国内企業のAI導入率が54%に到達、課題は人材と評価指標の整備";
    const gn = item({ url: "https://news.google.com/x", title: long, source: "Google News" });
    const orig = item({ url: "https://japan.zdnet.com/article/1", title: long, source: "ZDNet Japan" });
    const result = dedupe([gn, orig]);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("ZDNet Japan");
  });

  it("タイトル前方30文字が異なる記事は残す", () => {
    const a = item({ url: "https://example.com/a", title: "全く異なるタイトルの記事です" });
    const b = item({ url: "https://example.com/b", title: "こちらも別内容のニュースです" });
    expect(dedupe([a, b])).toHaveLength(2);
  });
});

describe("markNew（NEW判定）", () => {
  it("前回データに無いURLを isNew: true にする", () => {
    const prev = new Set(["https://example.com/old"]);
    const items = [
      item({ url: "https://example.com/old" }),
      item({ url: "https://example.com/new" }),
    ];
    const result = markNew(items, prev);
    expect(result[0].isNew).toBe(false);
    expect(result[1].isNew).toBe(true);
  });

  it("URLはクエリ除去後で比較する", () => {
    const prev = new Set(["https://example.com/old"]);
    const result = markNew([item({ url: "https://example.com/old?t=1" })], prev);
    expect(result[0].isNew).toBe(false);
  });

  it("初回実行（前回データなし）は全件false", () => {
    const result = markNew([item({ url: "https://example.com/new" })], null);
    expect(result[0].isNew).toBe(false);
  });
});

describe("withinDays（鮮度判定）", () => {
  const now = new Date("2026-06-10T07:00:00+09:00");

  it("7日以内の記事は採用する", () => {
    expect(withinDays("2026-06-04T07:00:00+09:00", now)).toBe(true);
  });

  it("7日より古い記事は除外する", () => {
    expect(withinDays("2026-06-01T07:00:00+09:00", now)).toBe(false);
  });

  it("不正な日付は除外する", () => {
    expect(withinDays("invalid-date", now)).toBe(false);
  });
});

describe("toJstIso（JST変換）", () => {
  it("UTCをJST（+09:00）のISO文字列にする", () => {
    expect(toJstIso(new Date("2026-06-09T22:00:00Z"))).toBe("2026-06-10T07:00:00+09:00");
  });
});
