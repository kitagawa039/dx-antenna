// ダイジェストパネル集計関数のテスト
import { describe, expect, it } from "vitest";
import type { FeedItem } from "./types";
import { headlines, parseEventDate, topKeywords, upcomingEvents } from "./summaryUtils";

const NOW = new Date("2026-06-10T07:00:00+09:00");

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

describe("topKeywords（注目キーワード集計）", () => {
  it("出現回数の多い順に返す", () => {
    const items = [
      item({ tags: ["生成AI", "DX"] }),
      item({ tags: ["生成AI"] }),
      item({ tags: ["Copilot"] }),
    ];
    expect(topKeywords(items)).toEqual([
      { keyword: "生成AI", count: 2 },
      { keyword: "Copilot", count: 1 },
      { keyword: "DX", count: 1 },
    ]);
  });

  it("上限数までに制限する", () => {
    const items = [item({ tags: ["a", "b", "c", "d", "e", "f"].map(String) })];
    expect(topKeywords(items, 5)).toHaveLength(5);
  });
});

describe("parseEventDate（開催日文字列の解釈）", () => {
  it("「2026/10/21」を解釈する", () => {
    expect(parseEventDate("2026/10/21", NOW)).toBe(new Date(2026, 9, 21).getTime());
  });

  it("「2026年10月21日」を解釈する", () => {
    expect(parseEventDate("2026年10月21日", NOW)).toBe(new Date(2026, 9, 21).getTime());
  });

  it("年なしの「7月9日」は基準日の年と解釈する", () => {
    expect(parseEventDate("7月9日", NOW)).toBe(new Date(2026, 6, 9).getTime());
  });

  it("年なしで60日以上過去なら翌年開催とみなす", () => {
    expect(parseEventDate("1月15日", NOW)).toBe(new Date(2027, 0, 15).getTime());
  });

  it("解釈できない文字列は null", () => {
    expect(parseEventDate("近日", NOW)).toBeNull();
    expect(parseEventDate("13月40日", NOW)).toBeNull();
  });
});

describe("upcomingEvents（開催間近イベント）", () => {
  it("開催日の近い順に返し、過去の開催は除外する", () => {
    const items = [
      item({ id: "a", type: "event", eventDate: "8月27日", title: "A" }),
      item({ id: "b", type: "event", eventDate: "7月9日", title: "B" }),
      item({ id: "c", type: "event", eventDate: "6月1日", title: "C(過去)" }),
      item({ id: "d", type: "event", title: "D(日付なし)" }),
      item({ id: "e", type: "news", title: "E(ニュース)" }),
    ];
    expect(upcomingEvents(items, NOW).map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("当日開催は含める", () => {
    const items = [item({ id: "a", type: "event", eventDate: "6月10日" })];
    expect(upcomingEvents(items, NOW)).toHaveLength(1);
  });
});

describe("headlines（ヘッドライン）", () => {
  it("NEWのニュースを優先して返す", () => {
    const items = [
      item({ id: "old", type: "news" }),
      item({ id: "new1", type: "news", isNew: true }),
      item({ id: "ev", type: "event", isNew: true }),
    ];
    expect(headlines(items, 2).map((i) => i.id)).toEqual(["new1", "old"]);
  });

  it("イベントは含めない", () => {
    const items = [item({ id: "ev", type: "event", isNew: true })];
    expect(headlines(items)).toHaveLength(0);
  });
});
