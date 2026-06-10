import { useMemo } from "react";
import type { FeedItem } from "../types";
import { headlines, topKeywords, upcomingEvents } from "../summaryUtils";

interface Props {
  items: FeedItem[];
  onKeywordClick: (keyword: string) => void;
}

/** ページを開いたとき最初に目に入るダイジェストパネル */
export default function Summary({ items, onKeywordClick }: Props) {
  const keywords = useMemo(() => topKeywords(items), [items]);
  const events = useMemo(() => upcomingEvents(items, new Date()), [items]);
  const heads = useMemo(() => headlines(items), [items]);

  if (items.length === 0) return null;

  const newsCount = items.filter((i) => i.type === "news").length;
  const eventCount = items.filter((i) => i.type === "event").length;
  const newCount = items.filter((i) => i.isNew).length;

  return (
    <section
      aria-label="けさのサマリー"
      className="relative overflow-hidden bg-white rounded-2xl border border-[#E8ECF0] shadow-[0_1px_3px_rgba(16,42,67,0.06)] p-4 sm:p-5 mb-6"
    >
      {/* 上端のアクセントライン */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #0068B7 0%, #00A0E9 60%, #5BC2F0 100%)" }}
      />
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="text-[15px] font-bold text-[#253746]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          けさのサマリー
        </h2>
        <p className="text-[12px] text-[#5A6472]">
          ニュース <strong className="tabular-nums">{newsCount}</strong> 件・イベント{" "}
          <strong className="tabular-nums">{eventCount}</strong> 件
          {newCount > 0 && (
            <>
              （うちNEW <strong className="text-[#00A0E9] tabular-nums">{newCount}</strong> 件）
            </>
          )}
        </p>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {/* 注目ヘッドライン */}
        {heads.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-[#8A919C] tracking-wider mb-1.5">注目ヘッドライン</h3>
            <ul className="space-y-1.5">
              {heads.map((i) => (
                <li key={i.id} className="text-[13px] leading-snug">
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#253746] hover:text-[#0068B7] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7]"
                  >
                    {i.isNew && (
                      <span className="text-[9px] font-bold px-1 py-0.5 mr-1.5 rounded-sm bg-[#00A0E9] text-white tracking-wider align-middle">
                        NEW
                      </span>
                    )}
                    {i.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 開催間近のイベント */}
        {events.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-[#8A919C] tracking-wider mb-1.5">開催間近のイベント</h3>
            <ul className="space-y-1.5">
              {events.map((i) => (
                <li key={i.id} className="text-[13px] leading-snug">
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#253746] hover:text-[#0068B7] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7]"
                  >
                    <span className="text-[11px] font-medium text-[#46535D] bg-[#EEF1F3] px-1.5 py-0.5 rounded-sm mr-1.5 tabular-nums whitespace-nowrap">
                      📅 {i.eventDate}
                    </span>
                    {i.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 注目キーワード（クリックで絞り込み） */}
      {keywords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#EEF1F3] flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#8A919C] tracking-wider mr-1">注目キーワード</span>
          {keywords.map((k) => (
            <button
              key={k.keyword}
              onClick={() => onKeywordClick(k.keyword)}
              className="text-[12px] px-2.5 py-1 rounded-full bg-[#EAF1F8] text-[#0068B7] hover:bg-[#0068B7] hover:text-white hover:shadow-[0_2px_8px_rgba(0,104,183,0.3)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7]"
            >
              {k.keyword} <span className="tabular-nums opacity-70">{k.count}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
