# DXアンテナ 要件定義書

## 1. システム概要

日本語のAI/DX関連ニュースおよびイベント(セミナー・展示会・EXPO)情報を毎朝自動収集し、リンク付き一覧として公開する静的Webサイト。

- ホスティング: GitHub Pages(公開リポジトリ)
- データ更新: GitHub Actionsによる定時RSS収集 → `public/data.json` 上書きコミット
- DB・サーバー・外部APIキー: 使用しない
- 想定閲覧デバイス: PC・スマホ両対応(レスポンシブ)

## 2. データ収集(scripts/collect.ts)

### 2.1 収集ソース

ニュース系RSS:

| ソース名 | フィードURL |
|---|---|
| ITmedia AI+ | https://rss.itmedia.co.jp/rss/2.0/aiplus.xml |
| ITmedia エンタープライズ | https://rss.itmedia.co.jp/rss/2.0/enterprise.xml |
| Publickey | https://www.publickey1.jp/atom.xml |
| ASCII.jp TECH | https://ascii.jp/rss.xml |
| ZDNet Japan | https://japan.zdnet.com/rss/index.rdf |

Google News検索RSS(クエリごとに1フィード):

```
https://news.google.com/rss/search?q={query}&hl=ja&gl=JP&ceid=JP:ja
```

- ニュース補完クエリ: `生成AI 企業`、`DX推進`
- イベント収集クエリ: `AI 展示会`、`AI セミナー 開催`、`DX EXPO`

※フィードURLは実装時に疎通確認し、無効なものは近いものに差し替えてよい。ソース定義は配列1箇所にまとめ、追加・削除を容易にすること。

### 2.2 フィルタリング・分類

1. **キーワードフィルタ**(汎用フィードのみ適用): タイトルに次のいずれかを含む記事のみ採用
   `AI / 生成AI / LLM / DX / Copilot / ChatGPT / Claude / Gemini / エージェント / 自動化 / RPA / データ活用 / 機械学習`
   ※ITmedia AI+ など専門フィードはフィルタなしで全件採用
2. **カテゴリ分類**: タイトルに `展示会 / EXPO / セミナー / ウェビナー / カンファレンス / 開催 / 来場` を含む → `event`、それ以外 → `news`
3. **イベント補足情報**: タイトルから日付らしき文字列(例: `7月8日`、`2026/10/21`)を正規表現で抽出できた場合のみ `eventDate` に設定。抽出できなければ省略(無理に推定しない)
4. **タグ付け**: フィルタキーワードのうちタイトルに含まれるものを最大3つ `tags` に設定

### 2.3 重複排除・件数制限

- URL正規化(クエリパラメータ除去)後の完全一致で重複排除
- タイトルの類似重複(Google Newsと元メディアの二重取得)は、タイトル前方30文字一致で同一とみなし、元メディア側を優先
- 公開日が7日より古い記事は除外
- 最終出力は新しい順に最大100件

### 2.4 NEW判定

前回の `data.json` を読み込み、そこに存在しないURLの記事を `isNew: true` とする(初回実行時は全件false)。

### 2.5 エラー処理

- フィード単位でtry-catch。失敗はconsole.errorに出してスキップ
- 全ソース失敗時のみ非ゼロ終了(既存data.jsonを保護するためコミットさせない)
- 各フィード取得はタイムアウト15秒

## 3. データ形式(public/data.json)

```json
{
  "updatedAt": "2026-06-10T07:00:00+09:00",
  "sourceCount": 10,
  "items": [
    {
      "id": "sha1のURLハッシュ先頭12桁",
      "type": "news",
      "title": "記事タイトル",
      "url": "https://...",
      "source": "ITmedia AI+",
      "publishedAt": "2026-06-10T05:30:00+09:00",
      "isNew": true,
      "tags": ["生成AI", "Copilot"],
      "eventDate": "2026-07-08(eventのみ・任意)",
      "place": null
    }
  ]
}
```

著作権配慮のため、記事本文・description・サムネイル画像は保存しない。

## 4. フロントエンド

### 4.1 画面構成(mock/dx-antenna-mock.jsx 準拠)

- **ヘッダー**: サイト名「DXアンテナ」、最終更新日時、収集サマリー(件数/NEW数/ソース数)
- **ツールバー**(sticky): タブ「すべて/ニュース/イベント」+ キーワード検索ボックス
- **カード一覧**: 2カラムグリッド(スマホは1カラム)
  - 左端: 縦色帯+漢字(報/催)
  - ソースチップ、収集日、NEWバッジ、タイトル、タグ
  - イベントは開催日・場所(取得できた場合のみ)
  - カード全体がリンク(target=_blank, rel=noopener)
- **空状態**: 検索0件・データ取得失敗時はメッセージ表示(エラー画面にしない)

### 4.2 機能要件

- タブ・検索はクライアントサイドで即時フィルタ(検索対象: タイトル+ソース+タグ)
- data.jsonは `fetch` で読み込み。キャッシュ回避に `?t=タイムスタンプ` 付与
- 表示順は publishedAt 降順
- 検索キーワードはURLに反映しない(シンプル優先)

### 4.3 非機能要件

- Lighthouse Performance 90以上を目安(画像なし構成なので達成容易)
- キーボードフォーカス可視化、`prefers-reduced-motion` 尊重
- OGP: サイト名と説明のみ(画像は任意)

## 5. CI/CD(GitHub Actions)

### 5.1 collect.yml(収集)

```yaml
on:
  schedule:
    - cron: '0 22 * * *'   # 22:00 UTC = 7:00 JST
  workflow_dispatch:        # 手動実行可
```

処理: checkout → Node 20 setup → `npm ci` → `npm run collect` → data.jsonに差分があればコミット&プッシュ(`github-actions[bot]`名義、`GITHUB_TOKEN`使用)

### 5.2 deploy.yml(デプロイ)

- mainブランチへのpush(収集コミット含む)をトリガーに `npm run build` → `actions/deploy-pages` でGitHub Pagesへ
- リポジトリ設定: Pages のソースを「GitHub Actions」にする手順をREADMEに記載

### 5.3 初期セットアップ手順(READMEに記載すること)

1. リポジトリ作成(public)、コード一式push
2. Settings → Pages → Source: GitHub Actions
3. Settings → Actions → General → Workflow permissions: Read and write
4. collect.ymlを手動実行して初回data.json生成
5. `https://{user}.github.io/dx-antenna/` で表示確認

## 6. スコープ外(将来拡張メモ)

- Claude APIによる要約・自動分類
- connpass API連携(利用申請後)
- 既読管理・お気に入り(localStorage)
- RSSソースの画面からの追加
