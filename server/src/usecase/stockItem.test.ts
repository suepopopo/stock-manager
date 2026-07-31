import { beforeEach, describe, expect, it } from "vitest";
import { DomainValidationError } from "../domain/errors.js";
import type { NewStockItem, StockItemRecord, StockItemRepository } from "./ports.js";
import { recordStockItemSale } from "./recordStockItemSale.js";
import { registerStockItem } from "./registerStockItem.js";

function createFakeRepository(): StockItemRepository {
  const rows = new Map<number, StockItemRecord>();
  let nextId = 1;
  return {
    async findAll() {
      return [...rows.values()];
    },
    async findById(id) {
      return rows.get(id) ?? null;
    },
    async create({ stockItem }) {
      const record: StockItemRecord = { id: nextId++, ...stockItem };
      rows.set(record.id, record);
      return record;
    },
    async updateSaleInfo(id, patch) {
      const existing = rows.get(id);
      if (!existing) {
        throw new Error("not found");
      }
      const updated = { ...existing, ...patch };
      rows.set(id, updated);
      return updated;
    },
    async remove(id) {
      rows.delete(id);
    },
  };
}

const validInput: NewStockItem = {
  productId: 1,
  accountKey: "main",
  purchaseTypeKey: "ec",
  purchaseSiteKey: "amazon",
  shopId: 1,
  purchasePrice: 1000,
  purchaseDate: "2026-07-01",
  paymentDetails: [{ paymentMethodId: 1, amount: 1000 }],
  pointDetails: [{ pointTypeId: 1, amount: 300 }],
};

describe("registerStockItem", () => {
  let repository: StockItemRepository;

  beforeEach(() => {
    repository = createFakeRepository();
  });

  it("実質価格・ポイント還元合計を自動計算し、未到着・未売却で登録する", async () => {
    const created = await registerStockItem(repository, validInput);
    expect(created.pointRewardTotal).toBe(300);
    expect(created.netPurchasePrice).toBe(700);
    expect(created.profit).toBeNull();
    expect(created.status).toBe("到着待ち");
  });

  it("仕入れ区分がECなのにpurchaseSiteKeyが無ければエラー", async () => {
    await expect(
      registerStockItem(repository, { ...validInput, purchaseSiteKey: undefined }),
    ).rejects.toThrow(DomainValidationError);
  });

  it("仕入れ区分が店舗なのにpurchaseSiteKeyがあればエラー", async () => {
    await expect(
      registerStockItem(repository, { ...validInput, purchaseTypeKey: "store" }),
    ).rejects.toThrow(DomainValidationError);
  });

  it("支払い内訳が空ならエラー", async () => {
    await expect(
      registerStockItem(repository, { ...validInput, paymentDetails: [] }),
    ).rejects.toThrow(DomainValidationError);
  });

  it("accountKeyが不正ならエラー", async () => {
    await expect(
      registerStockItem(repository, { ...validInput, accountKey: "unknown" }),
    ).rejects.toThrow(DomainValidationError);
  });
});

describe("recordStockItemSale", () => {
  let repository: StockItemRepository;

  beforeEach(() => {
    repository = createFakeRepository();
  });

  it("到着済みチェックのみ更新すると保有中になる", async () => {
    const created = await registerStockItem(repository, validInput);
    const updated = await recordStockItemSale(repository, created.id, { arrivedFlag: true });
    expect(updated.status).toBe("保有中");
    expect(updated.profit).toBeNull();
  });

  it("売却情報を記録すると利益・利益率を計算し売却済みになる（要件定義書 §3.8）", async () => {
    const created = await registerStockItem(repository, validInput);
    const updated = await recordStockItemSale(repository, created.id, {
      arrivedFlag: true,
      salesChannelId: 1,
      salesPrice: 1200,
      salesDate: "2026-07-15",
      soldFlag: true,
    });
    expect(updated.status).toBe("売却済み");
    expect(updated.profit).toBe(500); // 1200 - (1000 - 300)
    expect(updated.profitRate).toBeCloseTo(41.67, 2);
  });

  it("売上情報が揃わないまま売却済みにしようとするとエラー", async () => {
    const created = await registerStockItem(repository, validInput);
    await expect(
      recordStockItemSale(repository, created.id, { soldFlag: true }),
    ).rejects.toThrow(DomainValidationError);
  });

  it("存在しないIDを指定するとエラー", async () => {
    await expect(recordStockItemSale(repository, 999, { arrivedFlag: true })).rejects.toThrow(
      DomainValidationError,
    );
  });
});
