import { withStatus, type WithStatus } from "../domain/stockItem.js";
import type { StockItemRecord, StockItemRepository } from "./ports.js";

export async function listStockItems(
  repository: StockItemRepository,
): Promise<WithStatus<StockItemRecord>[]> {
  const records = await repository.findAll();
  return records.map(withStatus);
}
