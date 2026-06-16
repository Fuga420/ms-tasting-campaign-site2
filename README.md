# M's Tasting Room Campaign Site

M's Tasting Room の企画用デモサイトです。GitHub Pages でそのまま公開できます。

## 構成

```text
index.html                         最新企画
campaigns/index.html               バックナンバー一覧
campaigns/birthyear-vintage/       最新企画の個別ページ
campaigns/peated-malt-selection-2025-05/
campaigns/sherry-cask-collection-2025-04/
campaigns/japanese-whisky-feature-2025-03/
assets/css/style.css
assets/js/main.js
assets/js/backnumbers.js
data/campaigns.json
```

## 公開方法

リポジトリ直下に以下が並ぶようにアップロードしてください。

```text
index.html
README.md
.nojekyll
assets/
campaigns/
data/
```

GitHub Pages の Source は `Deploy from a branch`、Branch は `main / root` で公開します。

## 新しい企画を追加する流れ

1. `data/campaigns.json` に企画データを追加
2. `campaigns/新企画ID/index.html` を既存ページから複製
3. 複製したHTMLの `<body data-campaign-id="...">` を新企画IDに変更
4. `isCurrent` を最新企画だけ `true` にする
5. 最新企画としてトップに出したい場合は `index.html` の `<body data-campaign-id="...">` も新企画IDに変更

## ロゴリンク

ページ上部のロゴは以下に遷移します。

https://whisky-tastingroom.com/shop/ms-tastingroom/

## 画像差し替え

```text
assets/images/logo.jpg
assets/images/main.jpg
```

を差し替えると、ロゴとメインビジュアルが変わります。

## 注意

このサイトには検索避けのため、`noindex, nofollow` を入れています。本番公開で検索エンジンに出す場合は、各HTMLの以下を削除してください。

```html
<meta name="robots" content="noindex, nofollow" />
```
