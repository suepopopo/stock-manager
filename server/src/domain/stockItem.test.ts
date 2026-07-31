import { describe, expect, it } from "vitest";
import {
  calcNetPurchasePrice,
  calcPointRewardTotal,
  calcProfit,
  calcProfitRate,
  deriveStatus,
} from "./stockItem.js";

describe("calcPointRewardTotal", () => {
  it("sums point detail amounts", () => {
    expect(calcPointRewardTotal([{ amount: 100 }, { amount: 200 }])).toBe(300);
  });

  it("returns 0 for no point details", () => {
    expect(calcPointRewardTotal([])).toBe(0);
  });
});

describe("calcNetPurchasePrice", () => {
  it("subtracts point reward total from purchase price", () => {
    expect(calcNetPurchasePrice(1000, 300)).toBe(700);
  });
});

describe("calcProfit / calcProfitRate", () => {
  it("returns null when not yet sold", () => {
    expect(calcProfit(null, 700)).toBeNull();
    expect(calcProfitRate(null, null)).toBeNull();
  });

  it("計算式どおりに利益・利益率を算出する（要件定義書 §3.8）", () => {
    const netPurchasePrice = calcNetPurchasePrice(1000, 300); // 700
    const profit = calcProfit(1200, netPurchasePrice); // 1200 - 700 = 500
    const profitRate = calcProfitRate(profit, 1200); // 500 / 1200 * 100

    expect(profit).toBe(500);
    expect(profitRate).toBeCloseTo(41.67, 2);
  });
});

describe("deriveStatus", () => {
  it("到着済みチェックがfalseなら到着待ち", () => {
    expect(deriveStatus(false, false)).toBe("到着待ち");
  });

  it("到着済みチェックがtrueかつ売却チェックがfalseなら保有中", () => {
    expect(deriveStatus(true, false)).toBe("保有中");
  });

  it("売却チェックがtrueなら売却済み（到着チェックの値に関わらず優先）", () => {
    expect(deriveStatus(true, true)).toBe("売却済み");
    expect(deriveStatus(false, true)).toBe("売却済み");
  });
});
