export type TabKey = "all" | "news" | "event";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "news", label: "ニュース" },
  { key: "event", label: "イベント" },
];

interface Props {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

export default function Toolbar({ tab, onTabChange, query, onQueryChange }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-[#F4F6F8]/80 backdrop-blur-md border-b border-[#E3E6EB]/80">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* セグメント型タブ */}
        <div className="flex items-center gap-0.5 rounded-full bg-[#E7EBEF] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`px-4 py-1.5 text-[13px] rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7] ${
                tab === t.key
                  ? "bg-white text-[#0068B7] font-semibold shadow-[0_1px_4px_rgba(16,42,67,0.12)]"
                  : "text-[#5A6472] font-medium hover:text-[#253746]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 検索ボックス（アイコン付き） */}
        <div className="relative flex-1 min-w-[180px]">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA4B2] pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="キーワードで絞り込み(例:Copilot)"
            aria-label="キーワードで絞り込み"
            className="w-full pl-10 pr-4 py-2 text-[13px] rounded-full border border-[#E3E6EB] bg-white shadow-[0_1px_2px_rgba(16,42,67,0.04)] focus:outline-none focus:ring-2 focus:ring-[#0068B7] focus:border-transparent transition-shadow"
          />
        </div>
      </div>
    </div>
  );
}
