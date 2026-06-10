import { useEffect, useMemo, useState } from "react";
import type { CollectedData } from "./types";
import Header from "./components/Header";
import Toolbar, { type TabKey } from "./components/Toolbar";
import Card from "./components/Card";
import Summary from "./components/Summary";

/** 初期表示する件数（「もっと見る」で追加表示） */
const PAGE_SIZE = 20;

export default function App() {
  const [data, setData] = useState<CollectedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // data.json を読み込む（キャッシュ回避にタイムスタンプを付与）
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CollectedData>;
      })
      .then(setData)
      .catch(() => setData(null)) // 取得失敗時もエラー画面にせず空状態を表示
      .finally(() => setLoading(false));
  }, []);

  // タブ・検索を変えたら表示件数をリセットする
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, q]);

  // 表示順は publishedAt 降順
  const items = useMemo(() => {
    if (!data) return [];
    return [...data.items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [data]);

  // タブ・検索によるクライアントサイド即時フィルタ（タイトル+ソース+タグ）
  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (tab !== "all" && it.type !== tab) return false;
      if (q.trim()) {
        const s = q.trim().toLowerCase();
        const hay = (it.title + it.source + it.tags.join(" ")).toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [items, tab, q]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;
  const newCount = items.filter((i) => i.isNew).length;
  // サマリーは絞り込みしていない初期表示のときだけ出す
  const showSummary = tab === "all" && q.trim() === "";

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Header
        updatedAt={data?.updatedAt ?? null}
        totalCount={items.length}
        newCount={newCount}
        sourceCount={data?.sourceCount ?? 0}
      />

      <Toolbar tab={tab} onTabChange={setTab} query={q} onQueryChange={setQ} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-[#8A919C]">
            <p className="text-sm">読み込み中…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#8A919C]">
            <p className="text-sm">
              {items.length === 0
                ? "まだ情報がありません。次回の自動収集をお待ちください。"
                : "該当する情報がありません。キーワードを変えて検索してください。"}
            </p>
          </div>
        ) : (
          <>
            {showSummary && <Summary items={items} onKeywordClick={setQ} />}
            <div className="grid gap-3 sm:grid-cols-2">
              {visible.map((it) => (
                <Card key={it.id} item={it} />
              ))}
            </div>
            {remaining > 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE * 2)}
                  className="px-6 py-2 text-[13px] font-medium rounded-md border border-[#D5DAE1] bg-white text-[#5A6472] hover:bg-[#EAF1F8] hover:text-[#0068B7] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0068B7]"
                >
                  もっと見る（残り {remaining} 件）
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-8 text-center text-[11px] text-[#9AA4B2]">
        DXアンテナ — RSS収集による自動更新サイト / リンク先は各メディアに帰属します
      </footer>
    </div>
  );
}
