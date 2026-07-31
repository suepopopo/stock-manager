import type { ConfigEntry } from "./types.js";

// 仕入れ区分（要件定義書 §3.5）。EC の場合のみ purchaseSites を併用する。
export const purchaseTypes: ConfigEntry[] = [
  { key: "ec", label: "EC" },
  { key: "store", label: "店舗" },
];
