# DXアンテナ 全体実装 TODO（2026-06-10）

- [x] 1. プロジェクト雛形 + 整理（mock移動、Vite+React+TS+Tailwind、git init）
- [x] 2. 型定義（src/types.ts）
- [x] 3. 収集ロジック（scripts/lib.ts・scripts/collect.ts）
- [x] 4. テスト（scripts/lib.test.ts、Vitest 27件）
- [x] 5. フロントエンド（App.tsx・components 一式、モック忠実再現）
- [x] 6. CI/CD（collect.yml・deploy.yml）
- [x] 7. README.md（セットアップ手順）
- [x] 8. 検証（test 27件通過 / collect 10/10ソース100件 / preview+スクリーンショット目視 / build成功）
- [x] 9. GitHub公開（kitagawa039/dx-antenna へ push完了）

## レビュー

- 全要件をREQUIREMENTS.mdどおり実装。テスト27件通過、実RSS収集で10/10ソース成功（100件、news 78 / event 22）
- ZDNet Japanの要件記載フィードURLが404だったため、公式フィード `https://feeds.japan.zdnet.com/rss/zdnet/all.rdf` に差し替え（要件で許可済み）
- Edgeヘッドレスのスクリーンショットでモック同等のデザイン再現を目視確認
- 残作業（ユーザーのブラウザ操作が必要）:
  1. Settings → Pages → Source: GitHub Actions
  2. Settings → Actions → General → Workflow permissions: Read and write
  3. Actionsタブで「Pagesデプロイ」を手動実行（初回push時のデプロイはPages未設定のため失敗している可能性あり）
- 環境メモ: npm/Nodeは `NODE_OPTIONS=--use-system-ca` 必須（lessons.md参照）
