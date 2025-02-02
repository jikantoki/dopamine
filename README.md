# Vue Android App Template

Vue.js で Android ネイティブアプリを作るテンプレート

## 仕組み

Capacitor ってやつを使用

## Included

- Vue
- Vuetify
- Vue-router
- Pug
- SCSS/SASS
- Capacitor
- Capacitor の PWA/Toast 機能
- ライブリロードをサポート
- 試しに作ってみた APK ファイル

## 対応 OS

Android

## Project setup

```shell
yarn install
```

### ブラウザ上での動作確認

```shell
yarn serve
```

### APK ファイルにソースを反映

```shell
yarn build
```

### Android 用にコンパイル

```shell
# /capacitor.config.jsonのserver→url欄にこのPCのローカルIP:Portを入力
# それか、ライブリロードしない場合（apkに書き出すとか）はserverの記述を削除する
npx cap init #初期設定
npx cap add android #初回のみ必要
npx cap sync #データ同期
npx cap copy #必要な理由は知らん
npx cap open android #Android Studioが起動、ライブリロード対応
```

### Lints and fixes files

```shell
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
