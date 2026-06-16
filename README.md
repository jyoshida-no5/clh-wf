# D Wireframe Build

このディレクトリのHTMLは、`src` 配下のテンプレートから生成します。

## 編集する場所

- 共通パーツ: `src/partials/`
  - `head.html`
  - `header.html`
  - `footer.html`
  - `bottom-nav.html`
  - `modals.html`
  - `scripts.html`
- 各ページ本文: `src/pages/`
  - `index.html`
  - `event.html`
  - `event/detail.html`

## 生成コマンド

```sh
node _outputs/D_wireframe/build.mjs
```

生成後のHTMLは従来通り以下に出力されます。

- `index.html`
- `event.html`
- `event/detail.html`

## 新規ページ追加

`src/pages/` にHTMLテンプレートを追加し、先頭のJSONコメントで出力先とリンク基準を指定します。

```html
<!--
{
  "title": "ページタイトル",
  "out": "sample.html",
  "homeHref": "index.html",
  "eventHref": "event.html"
}
-->
{{> head}}
<body class="bg-white text-zinc-900 pb-20 lg:pb-0">
{{> header}}
<main>
  ...
</main>
{{> footer}}
{{> bottom-nav}}
{{> modals}}
{{> scripts}}
```
