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
    <div className="sticky top-0 z-10 bg-[#F4F6F8]/95 backdrop-blur border-b border-[#E3E6EB]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex rounded-md overflow-hidden border border-[#D5DAE1]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7] focus-visible:ring-inset ${
                tab === t.key
                  ? "bg-[#0068B7] text-white"
                  : "bg-white text-[#5A6472] hover:bg-[#EAF1F8]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="キーワードで絞り込み(例:Copilot)"
          aria-label="キーワードで絞り込み"
          className="flex-1 min-w-[180px] px-3 py-1.5 text-[13px] rounded-md border border-[#D5DAE1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0068B7] focus:border-transparent"
        />
      </div>
    </div>
  );
}
