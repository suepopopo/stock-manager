# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

せどり（転売）副業のための在庫・損益管理アプリ。現在Excel/CSVで管理している在庫台帳（在庫管理タブ＋商品一覧／支払いクレジットカード一覧／ショップ一覧／その他収入入力の各タブ）をWebアプリに移行する。

## 現在のステータス

**第一フェーズの要件定義・設計は完了。バックエンド（server）のAPIは主要機能を一通り実装・疎通確認済み。フロントエンド（client）はプレースホルダーのみで未着手。** pnpm workspaces によるモノレポ（`server`＝Node.js/TypeScript/Fastify、`client`＝Vue.js/TypeScript/Vite）。

バックエンドで実装済みのAPI（すべてBasic認証必須）:

- `products`／`shops`／`payment_methods`／`point_types`／`sales_channels`：一覧・登録・編集（PATCH）・論理削除（DELETE）
- `credit_cards`：同上＋accountKey/brandKey/statusの設定ファイル・enumバリデーション
- `credit_card_billings`：カード×請求年月の一覧・upsert（同一カード・年月への登録は上書き）
- `stock_items`（購入商品登録、メイン機能）：登録（支払い内訳・ポイント内訳を同一トランザクションで保存、ポイント還元合計・実質価格を自動計算）／一覧（ステータスを読み取り時に導出）／`PATCH /:id/sale`（到着・売却の記録、利益・利益率を再計算）／論理削除
- `GET /api/monthly-summary?yearMonth=YYYY-MM`：月次収益確認（仕入れ日基準・販売日基準の集計、要件定義書§3.9）

ドメイン層（利益計算・ステータス判定・月範囲計算等）とバリデーションロジックはvitestで26件のユニットテストを整備済み。すべてcurlで実DBに対して疎通確認済み。

### コマンド（リポジトリルートから）

- `pnpm install` — 依存関係インストール
- `pnpm dev:server` / `pnpm dev:client` — 開発サーバー起動（server: http://localhost:3000, client: http://localhost:5173、client→serverへは`/api`をプロキシ）
- `pnpm build` — server(tsc)・client(vue-tsc + vite)のビルド
- `pnpm test` — server側のvitestテスト実行
- `pnpm lint` — server・client双方のeslint実行
- `pnpm db:generate` — Drizzleスキーマ（`server/src/infra/db/schema.ts`）からマイグレーションSQL生成
- `pnpm db:migrate` — マイグレーション適用（要 `server/.env` の `DATABASE_URL`）

### ローカル開発環境

- Node.js 22（nvm管理）、pnpm（corepack経由）
- PostgreSQLはDockerを使わずOSに直接インストール（本番VPSと同じ方針）。ロール/DB名は`stock_manager`で作成済み
- `server/.env.example` を `server/.env` にコピーして使う

`docs/` の構成:

- `docs/せどり管理アプリ_要件定義書.md` — 唯一の要件定義書（正）。第一フェーズの機能要件・画面一覧・第二/三フェーズ構想を含む。会話で決定した内容は都度このファイルに反映済み（§6に未決事項があれば記載）。
- `docs/システム構成図.md` — システム構成図（設計フェーズ成果物）。
- `docs/DBテーブル定義書.md` — DBテーブル定義書（設計フェーズ成果物）。要件定義書の内容を実装可能なスキーマに落とし込んだもの。

## 技術構成

- フロントエンド: Vue.js（TypeScript）
- バックエンド: Node.js + TypeScript（Fastify等の軽量フレームワーク）。ドメイン／ユースケース／インフラの3層に分けた簡略クリーンアーキテクチャ
- DB: PostgreSQL
- 認証: Basic認証（単一/少数の固定アカウント運用、権限分離なし）
- 実行環境: さくらのVPS（1GBプラン）。Node.jsアプリ・PostgreSQLともにDockerを使わずVPS上に直接インストールし、systemdでプロセス管理（メモリ消費を抑えるため）
- アクセス: SSH鍵認証でVPSへ直接ログイン可能（Claude Codeが構成・デプロイ・運用を代行できる想定）。VPN・自宅サーバーは不採用

## データモデルの要点

詳細は `docs/DBテーブル定義書.md` を参照。要点のみ:

- メインテーブルは `stock_items`（在庫・取引の1行＝1商品の仕入〜売却）。実質価格・利益・利益率は自動計算項目。ステータス（到着待ち／保有中／売却済み）は `到着済みチェック` / `売却チェック` の2つの真偽値から自動判定する派生値。
- `point_details`（ポイント内訳）・`payment_details`（支払い内訳）はどちらも `stock_items` に対する1対多。
- マスタ: `products`（商品、JANはここに保持しstock_itemsはproduct_id経由で参照）、`credit_cards`、`shops`（仕入れ先の②具体的な仕入れ先名のみDBマスタ）、`sales_channels`（売却先、法人番号は任意）、`payment_methods`、`point_types`。
- **アカウント（仕入に使った自分たちの口座）・クレジットカードのブランド・仕入れ区分（EC/店舗）・①モール/カテゴリはDBマスタではなくアプリ設定ファイル（例: `config/accounts.ts`）でid→名称を定義する方針。** DB外部キーではなくアプリ側で解決する。
- 利用者は少数の固定アカウントのみ。ロール分離・削除権限の区別は第一フェーズでは不要。
