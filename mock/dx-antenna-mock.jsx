import { useState, useMemo } from "react";

// ===== サンプルデータ(本番はGitHub Actionsが生成するdata.jsonを読む) =====
const UPDATED_AT = "2026-06-10 07:00";

const ITEMS = [
  { id: 1, type: "news", title: "経産省、生成AI活用ガイドライン第3版を公開 中堅企業のDX推進を後押し", source: "ITmedia AI+", date: "2026-06-10", isNew: true, url: "#", tags: ["生成AI", "政策"] },
  { id: 2, type: "event", title: "Japan IT Week【秋】2026 開催決定 AI・業務自動化EXPOを併催", source: "Google News", date: "2026-06-10", isNew: true, url: "#", tags: ["展示会", "東京"], eventDate: "2026-10-21〜23", place: "幕張メッセ" },
  { id: 3, type: "news", title: "Microsoft、Copilot Coworkの企業向け新機能を発表 エージェント連携を強化", source: "Publickey", date: "2026-06-09", isNew: true, url: "#", tags: ["Copilot", "エージェント"] },
  { id: 4, type: "news", title: "国内企業のAI導入率が54%に到達、課題は「人材」と「評価指標」", source: "ZDNet Japan", date: "2026-06-09", isNew: false, url: "#", tags: ["調査", "AI導入"] },
  { id: 5, type: "event", title: "NexTech Week 2026【夏】AI・ブロックチェーン・量子の総合展", source: "Google News", date: "2026-06-08", isNew: false, url: "#", tags: ["展示会", "東京"], eventDate: "2026-07-08〜10", place: "東京ビッグサイト" },
  { id: 6, type: "news", title: "Anthropic、Claude Fable 5を発表 エージェント性能が大幅向上", source: "ASCII.jp", date: "2026-06-08", isNew: false, url: "#", tags: ["Claude", "LLM"] },
  { id: 7, type: "event", title: "生成AI業務活用セミナー2026 〜現場定着のKPI設計〜(オンライン無料)", source: "Google News", date: "2026-06-07", isNew: false, url: "#", tags: ["セミナー", "オンライン"], eventDate: "2026-06-25", place: "オンライン" },
  { id: 8, type: "news", title: "RPAから自律エージェントへ 業務自動化の世代交代が本格化", source: "ITmedia エンタープライズ", date: "2026-06-07", isNew: false, url: "#", tags: ["RPA", "自動化"] },
  { id: 9, type: "event", title: "AI博覧会 Summer 2026 ビジネス特化型AIの専門展示会", source: "Google News", date: "2026-06-06", isNew: false, url: "#", tags: ["展示会", "東京"], eventDate: "2026-08-27〜28", place: "東京国際フォーラム" },
  { id: 10, type: "news", title: "Power Platform最新アップデート Fabric統合でデータ分析基盤が進化", source: "Publickey", date: "2026-06-06", isNew: false, url: "#", tags: ["Power Platform", "Fabric"] },
  { id: 11, type: "news", title: "DX人材育成、社内勉強会型の研修が効果大 大手3社の事例", source: "ZDNet Japan", date: "2026-06-05", isNew: false, url: "#", tags: ["人材育成", "DX"] },
  { id: 12, type: "event", title: "DX推進担当者交流会 vol.18 〜AI導入の壁を越える〜", source: "Google News", date: "2026-06-05", isNew: false, url: "#", tags: ["セミナー", "交流会"], eventDate: "2026-07-02", place: "東京・大手町" },
];

const SOURCE_COUNT = 6;

// ===== カテゴリ定義 =====
const CAT = {
  news: { mark: "報", label: "ニュース", bar: "#0068B7", chip: "bg-[#EAF1F8] text-[#0068B7]" },
  event: { mark: "催", label: "イベント", bar: "#5A6B78", chip: "bg-[#EEF1F3] text-[#46535D]" },
};

const TABS = [
  { key: "all", label: "すべて" },
  { key: "news", label: "ニュース" },
  { key: "event", label: "イベント" },
];

function formatDate(d) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}`;
}

function Card({ item }) {
  const cat = CAT[item.type];
  return (
    <a
      href={item.url}
      className="group relative flex bg-white rounded-md overflow-hidden border border-[#E3E6EB] hover:border-[#0068B7] hover:shadow-[0_4px_16px_rgba(31,78,121,0.10)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7]"
    >
      {/* 左端:カテゴリマーク(縦の色帯+漢字一文字) */}
      <div
        className="flex flex-col items-center justify-start pt-3 w-9 shrink-0"
        style={{ backgroundColor: cat.bar }}
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
          <span className={`text-[11px] px-2 py-0.5 rounded-sm font-medium ${cat.chip}`}>{item.source}</span>
          <span className="text-[11px] text-[#8A919C] tabular-nums">{formatDate(item.date)} 収集</span>
          {item.isNew && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#00A0E9] text-white tracking-wider">NEW</span>
          )}
        </div>

        <h3 className="text-[15px] leading-relaxed font-semibold text-[#253746] group-hover:text-[#0068B7] transition-colors">
          {item.title}
        </h3>

        {item.type === "event" && (
          <div className="mt-2 text-[12px] text-[#5A6472] flex items-center gap-3 flex-wrap">
            <span className="tabular-nums">📅 {item.eventDate}</span>
            <span>📍 {item.place}</span>
          </div>
        )}

        <div className="mt-2 flex gap-1.5 flex-wrap">
          {item.tags.map((t) => (
            <span key={t} className="text-[11px] text-[#6B7480] before:content-['#']">{t}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function App() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return ITEMS.filter((it) => {
      if (tab !== "all" && it.type !== tab) return false;
      if (q.trim()) {
        const s = q.trim().toLowerCase();
        const hay = (it.title + it.source + it.tags.join(" ")).toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [tab, q]);

  const newCount = ITEMS.filter((i) => i.isNew).length;

  return (
    <div className="min-h-screen bg-[#F4F6F8]" style={{ fontFamily: "'IBM Plex Sans JP', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;700&family=IBM+Plex+Sans+JP:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ヘッダー */}
      <header className="bg-[#253746] text-white">
        <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-wide"
                style={{ fontFamily: "'Shippori Mincho', serif" }}
              >
                DXアンテナ
              </h1>
              <p className="text-[12px] text-[#9AA4B2] mt-1 tracking-wider">
                AI・DXのニュースとイベントを毎朝自動収集
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#9AA4B2]">最終更新</p>
              <p className="text-sm font-semibold tabular-nums">{UPDATED_AT}</p>
            </div>
          </div>

          {/* 収集サマリー帯 */}
          <div className="mt-4 flex items-center gap-4 text-[12px] text-[#C5CCD6] border-t border-[#323B4A] pt-3 flex-wrap">
            <span><strong className="text-white tabular-nums">{ITEMS.length}</strong> 件収集</span>
            <span><strong className="text-[#5BC2F0] tabular-nums">{newCount}</strong> 件NEW</span>
            <span><strong className="text-white tabular-nums">{SOURCE_COUNT}</strong> ソース</span>
            <span className="hidden sm:inline text-[#5A6472]">|</span>
            <span className="text-[#9AA4B2]">毎朝 7:00 にGitHub Actionsで自動更新</span>
          </div>
        </div>
      </header>

      {/* ツールバー */}
      <div className="sticky top-0 z-10 bg-[#F4F6F8]/95 backdrop-blur border-b border-[#E3E6EB]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex rounded-md overflow-hidden border border-[#D5DAE1]">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="キーワードで絞り込み(例:Copilot)"
            className="flex-1 min-w-[180px] px-3 py-1.5 text-[13px] rounded-md border border-[#D5DAE1] bg-white focus:outline-none focus:ring-2 focus:ring-[#0068B7] focus:border-transparent"
          />
        </div>
      </div>

      {/* カード一覧 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#8A919C]">
            <p className="text-sm">該当する情報がありません。キーワードを変えて検索してください。</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((it) => (
              <Card key={it.id} item={it} />
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-8 text-center text-[11px] text-[#9AA4B2]">
        DXアンテナ — RSS収集による自動更新サイト / リンク先は各メディアに帰属します
      </footer>
    </div>
  );
}
