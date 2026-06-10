# DXアンテナ

AI・DXの日本語ニュースとセミナー・展示会情報を毎朝自動収集し、GitHub Pagesで公開する静的ダッシュボード。

公開URL: https://kitagawa039.github.io/dx-antenna/

## 仕組み

- GitHub Actions（毎朝 7:00 JST）が公開RSSを収集し `public/data.json` を上書きコミット
- mainへのpushをトリガーにGitHub Pagesへ自動デプロイ
- DB・バックエンド・APIキーは一切使わない（費用ゼロ）
- 著作権配慮のため、保存するのはタイトル・リンク・ソース名・日付・タグのみ（本文・要約は保存しない）

## 技術スタック

- React 18 + Vite + TypeScript + Tailwind CSS
- RSS収集: Node.js（tsx実行）+ rss-parser
- テスト: Vitest

## 開発コマンド

```bash
npm install        # 初回のみ
npm run dev        # 開発サーバー
npm run collect    # RSS収集をローカル実行(public/data.jsonを更新)
npm run build      # 本番ビルド
npm run test       # Vitest
```

## 初期セットアップ手順

1. GitHubに公開リポジトリ `dx-antenna` を作成し、コード一式をpush
2. Settings → Pages → Source: **GitHub Actions** に設定
3. Settings → Actions → General → Workflow permissions: **Read and write permissions** に設定
4. Actionsタブから `RSS収集` ワークフローを手動実行（workflow_dispatch）して初回 `data.json` を生成
5. `https://{user}.github.io/dx-antenna/` で表示確認

※ ワークフロー（`.github/workflows/`）はGitHub上でのみ実行されます。ローカルでは `npm run collect` で同じ収集処理を確認できます。

## 収集ソースの追加・削除

`scripts/collect.ts` の `SOURCES` 配列を編集するだけで追加・削除できます。

- `requireKeyword: true` … 汎用フィード。タイトルにAI/DX系キーワードを含む記事のみ採用
- `requireKeyword: false` … 専門フィード・Google News検索。全件採用

## ライセンス・帰属

リンク先の記事・情報は各メディアに帰属します。本サイトはタイトルとリンクのみを掲載するリンク集です。
