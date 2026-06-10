# DXアンテナ — CLAUDE.md

AI・DXのニュースとイベント情報を毎朝自動収集し、GitHub Pagesで公開する静的ダッシュボード。

## プロジェクト概要

- **目的**: 日本語のAI/DX関連ニュースとセミナー・展示会情報をRSSで収集し、リンク集として一覧表示する
- **更新方式**: GitHub Actions(毎朝 7:00 JST)がRSSを収集し `public/data.json` を上書きコミット → Pagesに自動デプロイ
- **DB・バックエンド・APIキーは一切使わない**(費用ゼロ)
- **個人情報は一切含めない**(完全公開リポジトリ前提)
- 詳細要件は `REQUIREMENTS.md` を必ず参照すること

## 技術スタック

- React 18 + Vite + TypeScript
- Tailwind CSS
- RSS収集: Node.js (TypeScript, tsx実行) + `rss-parser`
- デプロイ: GitHub Actions → GitHub Pages
- テスト: Vitest(収集スクリプトのパース・分類ロジックのみ必須)

## ディレクトリ構成

```
/
├── src/                  # フロントエンド
│   ├── App.tsx
│   ├── components/
│   └── types.ts          # FeedItem型定義(scriptsと共有)
├── scripts/
│   └── collect.ts        # RSS収集スクリプト
├── public/
│   └── data.json         # 収集結果(Actionsが上書き)
├── .github/workflows/
│   ├── collect.yml       # 定時収集(cron + 手動実行)
│   └── deploy.yml        # Pagesデプロイ
├── mock/
│   └── dx-antenna-mock.jsx  # デザインモック(参照用、ビルド対象外)
├── CLAUDE.md
└── REQUIREMENTS.md
```

## デザイン規約(TISインテックグループカラー)

`mock/dx-antenna-mock.jsx` のデザインを忠実に再現すること。カラートークン:

| トークン | 値 | 用途 |
|---|---|---|
| ocean-blue | `#0068B7` | プライマリ。ニュースのカテゴリ帯、タブ選択、リンクホバー |
| ocean-blue-light | `#EAF1F8` | ソースチップ背景 |
| intelligent-gray | `#5A6B78` | イベントのカテゴリ帯 |
| gray-chip | `#EEF1F3` / `#46535D` | イベント系チップ背景/文字 |
| header-dark | `#253746` | ヘッダー背景 |
| accent-new | `#00A0E9` | NEWバッジ |
| bg | `#F4F6F8` | ページ背景 |

フォント: 見出し `Shippori Mincho`、本文 `IBM Plex Sans JP`(Google Fonts)。
カードの左端は縦色帯+漢字一文字(報=ニュース/催=イベント)。これがこのサイトの顔なので必ず実装する。

## 開発コマンド

```bash
npm run dev        # 開発サーバー
npm run collect    # RSS収集をローカル実行(public/data.jsonを更新)
npm run build      # 本番ビルド
npm run test       # Vitest
```

## 重要な制約

1. **著作権配慮**: 記事の本文・要約は保存しない。保存するのはタイトル、リンク、ソース名、日付、タグのみ
2. **APIキー・シークレット禁止**: 収集は公開RSSのみ。`GITHUB_TOKEN`(自動付与)以外のシークレットを要求しない
3. **収集失敗に強く**: 1ソースの取得失敗で全体を落とさない。失敗ソースはスキップしてログ出力
4. **vite.config の `base`**: GitHub Pagesのリポジトリパス(`/dx-antenna/`)を設定すること
5. data.jsonが取得できない・空の場合もUIはエラーにせず空状態メッセージを表示

## コーディング規約

- TypeScript strict mode
- コメント・コミットメッセージは日本語
- コンポーネントは関数コンポーネント+hooks
- 収集ロジック(分類・重複排除・NEW判定)は純粋関数として切り出しテストを書く
