# `prrev` (Pull Request Review)
[GitHubのNotifications](https://github.com/notifications)に存在する未読のレビューリクエストを確認できるコマンド

# インストール
`deno install -A https://raw.githubusercontent.com/bigdragon0610/prrev/main/prrev.ts`

# 使い方
1. GitHubのトークンを作成
    -  [Personal access tokens (classic)](https://github.com/settings/tokens/new)から、**notifications**の権限でトークンを作成
1. `prrev configure`
    - 作成したトークンを入力
    - ホームディレクトリの`.prrev.token`に保存される
1. `prrev`
    - レビューリクエストを選択してブラウザで確認
