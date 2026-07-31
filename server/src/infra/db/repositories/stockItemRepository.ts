import { eq } from "drizzle-orm";
import type {
  NewPaymentDetail,
  NewPointDetail,
  StockItemRecord,
  StockItemRepository,
} from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { paymentDetails, pointDetails, stockItems } from "../schema.js";

function toRecord(row: typeof stockItems.$inferSelect): StockItemRecord {
  return {
    id: row.id,
    productId: row.productId,
    groupId: row.groupId,
    accountKey: row.accountKey,
    purchaseTypeKey: row.purchaseTypeKey,
    purchaseSiteKey: row.purchaseSiteKey,
    shopId: row.shopId,
    purchasePrice: row.purchasePrice,
    purchaseDate: row.purchaseDate,
    pointRewardTotal: row.pointRewardTotal,
    netPurchasePrice: row.netPurchasePrice,
    salesChannelId: row.salesChannelId,
    salesPrice: row.salesPrice,
    salesDate: row.salesDate,
    profit: row.profit,
    profitRate: row.profitRate === null ? null : Number(row.profitRate),
    arrivedFlag: row.arrivedFlag,
    soldFlag: row.soldFlag,
    memo: row.memo,
  };
}

export function createStockItemRepository(db: typeof Db): StockItemRepository {
  return {
    async findAll() {
      const rows = await db.select().from(stockItems).where(eq(stockItems.deleteFlag, false));
      return rows.map(toRecord);
    },

    async findById(id: number) {
      const rows = await db
        .select()
        .from(stockItems)
        .where(eq(stockItems.id, id))
        .limit(1);
      return rows[0] ? toRecord(rows[0]) : null;
    },

    async create({ stockItem, paymentDetails: newPaymentDetails, pointDetails: newPointDetails }) {
      return db.transaction(async (tx) => {
        const created = await tx
          .insert(stockItems)
          .values({
            ...stockItem,
            profitRate: stockItem.profitRate === null ? null : String(stockItem.profitRate),
          })
          .returning();
        const stockItemId = created[0].id;

        if (newPaymentDetails.length > 0) {
          await tx.insert(paymentDetails).values(
            newPaymentDetails.map((detail: NewPaymentDetail) => ({
              stockItemId,
              paymentMethodId: detail.paymentMethodId,
              amount: detail.amount,
              creditCardId: detail.creditCardId ?? null,
              pointTypeId: detail.pointTypeId ?? null,
              memo: detail.memo ?? null,
            })),
          );
        }

        if (newPointDetails.length > 0) {
          await tx.insert(pointDetails).values(
            newPointDetails.map((detail: NewPointDetail) => ({
              stockItemId,
              pointTypeId: detail.pointTypeId,
              amount: detail.amount,
            })),
          );
        }

        return toRecord(created[0]);
      });
    },

    async updateSaleInfo(id: number, patch) {
      const updated = await db
        .update(stockItems)
        .set({
          salesChannelId: patch.salesChannelId,
          salesPrice: patch.salesPrice,
          salesDate: patch.salesDate,
          arrivedFlag: patch.arrivedFlag,
          soldFlag: patch.soldFlag,
          profit: patch.profit,
          profitRate: patch.profitRate === null ? null : String(patch.profitRate),
          updatedAt: new Date(),
        })
        .where(eq(stockItems.id, id))
        .returning();
      return toRecord(updated[0]);
    },

    async remove(id: number) {
      await db
        .update(stockItems)
        .set({ deleteFlag: true, updatedAt: new Date() })
        .where(eq(stockItems.id, id));
    },
  };
}
