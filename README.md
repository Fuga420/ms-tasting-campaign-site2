# M's Tasting Room Campaign Site

M's Tasting Room の企画用デモサイトです。親会社サイトの「上質・落ち着き・ウイスキーらしさ」をトーンマナーとして参考にしつつ、商品リストの見やすさを主役にした静的サイトです。

## 内容

- `index.html`：トップページ
- `assets/css/style.css`：デザイン
- `assets/js/main.js`：検索・絞り込み・並び替え
- `data/campaigns.json`：企画情報と商品リスト
- `.nojekyll`：GitHub Pagesで静的ファイルをそのまま配信するための空ファイル

## データ更新方法

毎月の企画を追加する場合は、`data/campaigns.json` の `campaigns` 配列に企画を追加してください。
現在表示したい企画だけ `isCurrent: true` にします。

```json
{
  "id": "new-campaign-id",
  "title": "企画タイトル",
  "subtitle": "短いコピー",
  "period": "2026.07",
  "lead": "企画概要文",
  "isCurrent": true,
  "items": []
}
```

## ローカル確認

JSONを読み込むため、`index.html` を直接ダブルクリックするのではなく、簡易サーバーで確認します。

```bash
python3 -m http.server 8080
```

その後、ブラウザで以下を開きます。

```text
http://localhost:8080
```

## GitHub Pagesで公開

1. GitHubで新規リポジトリを作成
2. このフォルダの中身をリポジトリ直下へアップロード
3. `Settings > Pages` を開く
4. `Build and deployment` の `Source` を `Deploy from a branch` にする
5. `Branch` を `main`、フォルダを `/root` にする
6. 数分後に公開URLへアクセス

## 注意

掲載内容は企画用デモです。実販売・予約・決済・問い合わせ機能は含めていません。

## 画像の差し替え

ヒーロー画像を使う場合は、以下の場所に画像をアップロードしてください。

```text
assets/images/main.jpg
```

別のファイル名を使う場合は、`assets/css/style.css` の以下を変更してください。

```css
url("../images/main.jpg")
```


## ロゴリンク

ヘッダー上部のロゴは以下の親会社サイトへ遷移します。

https://whisky-tastingroom.com/shop/ms-tastingroom/

別タブで開く設定です。


## 追加済みテスト企画

以下のバックナンバーを追加しています。

- `campaigns/ms-select-5-staff-edition-2025-03/`
  - M’s Select 5 — Staff Edition —
  - 告知画像: `assets/images/ms-select-5-staff-edition.png`

バックナンバー一覧は `campaigns/` から確認できます。
