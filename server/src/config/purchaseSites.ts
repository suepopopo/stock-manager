import type { ConfigEntry } from "./types.js";

// ①モール/カテゴリ（要件定義書 §3.5）。仕入れ区分が EC の場合のみ使用する。
export const purchaseSites: ConfigEntry[] = [
  { key: "yahoo_shopping", label: "ヤフーショッピング" },
  { key: "rakuten_ichiba", label: "楽天市場" },
  { key: "amazon", label: "Amazon" },
  { key: "official_online_shop", label: "公式オンラインショップ" },
];
