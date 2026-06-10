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
            <p className="text-sm font-semibold tabular-nums">
              {updatedAt ? formatUpdatedAt(updatedAt) : "—"}
            </p>
          </div>
        </div>

        {/* 収集サマリー帯 */}
        <div className="mt-4 flex items-center gap-4 text-[12px] text-[#C5CCD6] border-t border-[#323B4A] pt-3 flex-wrap">
          <span><strong className="text-white tabular-nums">{totalCount}</strong> 件収集</span>
          <span><strong className="text-[#5BC2F0] tabular-nums">{newCount}</strong> 件NEW</span>
          <span><strong className="text-white tabular-nums">{sourceCount}</strong> ソース</span>
          <span className="hidden sm:inline text-[#5A6472]">|</span>
          <span className="text-[#9AA4B2]">毎朝 7:00 にGitHub Actionsで自動更新</span>
        </div>
      </div>
    </header>
  );
}
