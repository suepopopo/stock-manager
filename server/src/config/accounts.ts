import type { ConfigEntry } from "./types.js";

// 仕入れに使った自分たちの口座。DBマスタではなくここで管理する（要件定義書 §3.3.1 備考）。
export const accounts: ConfigEntry[] = [
  { key: "main", label: "本垢" },
  { key: "wife", label: "嫁垢" },
];
