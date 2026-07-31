import type { ConfigEntry } from "./types.js";

// クレジットカードブランド（要件定義書 §3.3.1）。
export const creditCardBrands: ConfigEntry[] = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "Mastercard" },
  { key: "jcb", label: "JCB" },
  { key: "amex", label: "Amex" },
];
