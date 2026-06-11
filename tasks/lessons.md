# Lessons（自己改善メモ）

- GitHubへの公開は kitagawa039 アカウント配下に行う（ユーザー指定。2026-06-10）
- この環境ではnpmが `UNABLE_TO_VERIFY_LEAF_SIGNATURE` で失敗・ハングする。**`$env:NODE_OPTIONS = "--use-system-ca"` を設定してから実行する**こと（TLS検査型セキュリティソフトが原因。2026-06-10）
- npm installが無出力で10分進まない場合はハングを疑い、`npm ping` で疎通を切り分ける
- **GITHUB_TOKENによるpushは他のワークフローをトリガーしない**（再帰防止のGitHub仕様）。ワークフローからのコミットで別ワークフローを動かしたい場合は `gh workflow run` で明示起動する（workflow_dispatch/repository_dispatchは制限対象外）。要 `permissions: actions: write`（2026-06-11、デプロイ未実行の不具合で学習）
- 縦中央寄せ（flex align-items:center）と `height: 100%` の併用は、コンテンツが画面より高いときに上部が見切れてスクロールでも届かなくなる。`min-height` のみにするか `safe center` を使う（2026-06-11、2048モバイル見切れで学習）
