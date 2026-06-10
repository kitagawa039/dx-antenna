interface Props {
  updatedAt: string | null;
  totalCount: number;
  newCount: number;
  sourceCount: number;
}

/** ISO日時を YYYY-MM-DD HH:mm 表示にする */
function formatUpdatedAt(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : iso;
}

export default function Header({ updatedAt, totalCount, newCount, sourceCount }: Props) {
  return (
    <header
      className="text-white relative"
      style={{ background: "linear-gradient(135deg, #1B2B3A 0%, #253746 55%, #1E3D5C 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-4 pt-7 pb-6 sm:pt-9 sm:pb-7">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-wide"
              style={{ fontFamily: "'Shippori Mincho', serif" }}
            >
              DXアンテナ
            </h1>
            <p className="text-[12px] text-[#9AB0C4] mt-2 tracking-[0.18em]">
              AI・DXのニュースとイベントを毎朝自動収集
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#7E94A8] tracking-[0.15em] uppercase">最終更新</p>
            <p className="text-sm font-semibold tabular-nums mt-0.5">
              {updatedAt ? formatUpdatedAt(updatedAt) : "—"}
            </p>
          </div>
        </div>

        {/* 収集サマリー帯（ガラス風チップ） */}
        <div className="mt-5 flex items-center gap-2.5 text-[12px] flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white/[0.08] ring-1 ring-white/10 text-[#C5CCD6]">
            <strong className="text-white tabular-nums font-semibold">{totalCount}</strong> 件収集
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.08] ring-1 ring-white/10 text-[#C5CCD6]">
            <strong className="text-[#5BC2F0] tabular-nums font-semibold">{newCount}</strong> 件NEW
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.08] ring-1 ring-white/10 text-[#C5CCD6]">
            <strong className="text-white tabular-nums font-semibold">{sourceCount}</strong> ソース
          </span>
          <span className="text-[#7E94A8] ml-1">毎朝 7:00 にGitHub Actionsで自動更新</span>
        </div>
      </div>

      {/* 下端のアクセントライン */}
      <div
        className="h-[3px] w-full"
        style={{ background: "linear-gradient(90deg, #0068B7 0%, #00A0E9 60%, #5BC2F0 100%)" }}
      />
    </header>
  );
}
