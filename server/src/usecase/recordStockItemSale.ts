import { calcProfit, calcProfitRate, withStatus, type WithStatus } from "../domain/stockItem.js";
import { DomainValidationError } from "../domain/errors.js";
import type { StockItemRecord, StockItemRepository, StockItemSaleUpdate } from "./ports.js";

export async function recordStockItemSale(
  repository: StockItemRepository,
  id: number,
  patch: StockItemSaleUpdate,
): Promise<WithStatus<StockItemRecord>> {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new DomainValidationError(`stock item not found: ${id}`);
  }

  const merged = {
    salesChannelId: patch.salesChannelId ?? existing.salesChannelId,
    salesPrice: patch.salesPrice ?? existing.salesPrice,
    salesDate: patch.salesDate ?? existing.salesDate,
    arrivedFlag: patch.arrivedFlag ?? existing.arrivedFlag,
    soldFlag: patch.soldFlag ?? existing.soldFlag,
  };

  if (merged.soldFlag && (merged.salesChannelId === null || merged.salesPrice === null || merged.salesDate === null)) {
    throw new DomainValidationError(
      "salesChannelId / salesPrice / salesDate must be set before marking as sold",
    );
  }

  const profit = calcProfit(merged.salesPrice, existing.netPurchasePrice);
  const profitRate = calcProfitRate(profit, merged.salesPrice);

  const updated = await repository.updateSaleInfo(id, {
    salesChannelId: merged.salesChannelId,
    salesPrice: merged.salesPrice,
    salesDate: merged.salesDate,
    arrivedFlag: merged.arrivedFlag,
    soldFlag: merged.soldFlag,
    profit,
    profitRate,
  });

  return withStatus(updated);
}
