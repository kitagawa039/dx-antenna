// FeedItem型定義（フロントエンドと収集スクリプトで共有）

/** 記事の種別: ニュース or イベント */
export type ItemType = "news" | "event";

/** 収集した1記事分のデータ */
export interface FeedItem {
  /** URLのsha1ハッシュ先頭12桁 */
  id: string;
  type: ItemType;
  title: string;
  url: string;
  /** ソース名（例: ITmedia AI+） */
  source: string;
  /** 公開日時（ISO 8601） */
  publishedAt: string;
  /** 前回収集時に存在しなかった記事ならtrue */
  isNew: boolean;
  /** タイトルに含まれるキーワード（最大3つ） */
  tags: string[];
  /** イベントのみ: タイトルから抽出した開催日らしき文字列（任意） */
  eventDate?: string;
  /** イベントのみ: 開催場所（取得できた場合のみ） */
  place?: string | null;
}

/** public/data.json 全体の形式 */
export interface CollectedData {
  /** 収集実行日時（ISO 8601、JST） */
  updatedAt: string;
  /** 収集に成功したソース数 */
  sourceCount: number;
  items: FeedItem[];
}
