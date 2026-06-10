import type { FeedItem, ItemType } from "../types";

// カテゴリ定義（左端の縦色帯+漢字一文字がこのサイトの顔）
const CAT: Record<ItemType, { mark: string; label: string; band: string; chip: string }> = {
  news: {
    mark: "報",
    label: "ニュース",
    band: "linear-gradient(180deg, #0068B7 0%, #00A0E9 130%)",
    chip: "bg-[#EAF1F8] text-[#0068B7]",
  },
  event: {
    mark: "催",
    label: "イベント",
    band: "linear-gradient(180deg, #5A6B78 0%, #46535D 130%)",
    chip: "bg-[#EEF1F3] text-[#46535D]",
  },
};

/** ISO日時を MM/DD 表示にする */
function formatDate(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `${m[1]}/${m[2]}` : "";
}

export default function Card({ item }: { item: FeedItem }) {
  const cat = CAT[item.type];
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex bg-white rounded-xl overflow-hidden border border-[#E8ECF0] shadow-[0_1px_2px_rgba(16,42,67,0.05)] hover:border-[#0068B7]/30 hover:shadow-[0_12px_28px_rgba(0,53,93,0.13)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7]"
    >
      {/* 左端:カテゴリマーク(縦の色帯+漢字一文字) */}
      <div
        className="flex flex-col items-center justify-start pt-3.5 w-9 shrink-0"
        style={{ background: cat.band }}
      >
        <span
          className="text-white text-sm font-bold select-none"
          style={{ fontFamily: "'Shippori Mincho', serif", writingMode: "vertical-rl", letterSpacing: "0.2em" }}
        >
          {cat.mark}
        </span>
      </div>

      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${cat.chip}`}>{item.source}</span>
          <span className="text-[11px] text-[#8A919C] tabular-nums">{formatDate(item.publishedAt)} 収集</span>
          {item.isNew && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wider"
              style={{ background: "linear-gradient(90deg, #00A0E9 0%, #0068B7 100%)" }}
            >
              NEW
            </span>
          )}
        </div>

        <h3 className="text-[15px] leading-relaxed font-semibold text-[#253746] group-hover:text-[#0068B7] transition-colors duration-200">
          {item.title}
        </h3>

        {item.type === "event" && (item.eventDate || item.place) && (
          <div className="mt-2 text-[12px] text-[#5A6472] flex items-center gap-3 flex-wrap">
            {item.eventDate && <span className="tabular-nums">📅 {item.eventDate}</span>}
            {item.place && <span>📍 {item.place}</span>}
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {item.tags.map((t) => (
              <span key={t} className="text-[11px] text-[#6B7480] before:content-['#']">{t}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
