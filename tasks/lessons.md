# Lessons（自己改善メモ）

- GitHubへの公開は kitagawa039 アカウント配下に行う（ユーザー指定。2026-06-10）
- この環境ではnpmが `UNABLE_TO_VERIFY_LEAF_SIGNATURE` で失敗・ハングする。**`$env:NODE_OPTIONS = "--use-system-ca"` を設定してから実行する**こと（TLS検査型セキュリティソフトが原因。2026-06-10）
- npm installが無出力で10分進まない場合はハングを疑い、`npm ping` で疎通を切り分ける
