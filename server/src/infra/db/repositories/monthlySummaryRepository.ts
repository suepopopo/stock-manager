import { and, eq, gte, lt } from "drizzle-orm";
import { monthRange } from "../../../domain/monthRange.js";
import type { MonthlySummary, MonthlySummaryRepository } from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { stockItems } from "../schema.js";

export function createMonthlySummaryRepository(db: typeof Db): MonthlySummaryRepository {
  return {
    async findByMonth(yearMonth: string): Promise<MonthlySummary> {
      const { start, end } = monthRange(yearMonth);

      const purchasedRows = await db
        .select({ purchasePrice: stockItems.purchasePrice })
        .from(stockItems)
        .where(
          and(
            eq(stockItems.deleteFlag, false),
            gte(stockItems.purchaseDate, start),
            lt(stockItems.purchaseDate, end),
          ),
        );

      const soldRows = await db
        .select({ salesPrice: stockItems.salesPrice, profit: stockItems.profit })
        .from(stockItems)
        .where(
          and(
            eq(stockItems.deleteFlag, false),
            gte(stockItems.salesDate, start),
            lt(stockItems.salesDate, end),
          ),
        );

      return {
        yearMonth,
        purchaseTotal: purchasedRows.reduce((sum, row) => sum + row.purchasePrice, 0),
        salesTotal: soldRows.reduce((sum, row) => sum + (row.salesPrice ?? 0), 0),
        profitTotal: soldRows.reduce((sum, row) => sum + (row.profit ?? 0), 0),
      };
    },
  };
}
