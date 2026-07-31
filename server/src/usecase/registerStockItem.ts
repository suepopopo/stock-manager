import { accounts } from "../config/accounts.js";
import { purchaseSites } from "../config/purchaseSites.js";
import { purchaseTypes } from "../config/purchaseTypes.js";
import { calcNetPurchasePrice, calcPointRewardTotal, withStatus, type WithStatus } from "../domain/stockItem.js";
import { DomainValidationError } from "../domain/errors.js";
import type { NewStockItem, StockItemRecord, StockItemRepository } from "./ports.js";

const EC_PURCHASE_TYPE_KEY = "ec";

export async function registerStockItem(
  repository: StockItemRepository,
  input: NewStockItem,
): Promise<WithStatus<StockItemRecord>> {
  if (!accounts.some((a) => a.key === input.accountKey)) {
    throw new DomainValidationError(`unknown accountKey: ${input.accountKey}`);
  }
  if (!purchaseTypes.some((t) => t.key === input.purchaseTypeKey)) {
    throw new DomainValidationError(`unknown purchaseTypeKey: ${input.purchaseTypeKey}`);
  }

  if (input.purchaseTypeKey === EC_PURCHASE_TYPE_KEY) {
    if (!input.purchaseSiteKey) {
      throw new DomainValidationError("purchaseSiteKey is required when purchaseTypeKey is 'ec'");
    }
    if (!purchaseSites.some((s) => s.key === input.purchaseSiteKey)) {
      throw new DomainValidationError(`unknown purchaseSiteKey: ${input.purchaseSiteKey}`);
    }
  } else if (input.purchaseSiteKey) {
    throw new DomainValidationError(
      "purchaseSiteKey must not be set when purchaseTypeKey is not 'ec'",
    );
  }

  if (input.paymentDetails.length === 0) {
    throw new DomainValidationError("paymentDetails must not be empty");
  }

  const pointRewardTotal = calcPointRewardTotal(input.pointDetails);
  const netPurchasePrice = calcNetPurchasePrice(input.purchasePrice, pointRewardTotal);

  const created = await repository.create({
    stockItem: {
      productId: input.productId,
      groupId: input.groupId ?? null,
      accountKey: input.accountKey,
      purchaseTypeKey: input.purchaseTypeKey,
      purchaseSiteKey: input.purchaseSiteKey ?? null,
      shopId: input.shopId,
      purchasePrice: input.purchasePrice,
      purchaseDate: input.purchaseDate,
      pointRewardTotal,
      netPurchasePrice,
      salesChannelId: null,
      salesPrice: null,
      salesDate: null,
      profit: null,
      profitRate: null,
      arrivedFlag: input.arrivedFlag ?? false,
      soldFlag: false,
      memo: input.memo ?? null,
    },
    paymentDetails: input.paymentDetails,
    pointDetails: input.pointDetails,
  });

  return withStatus(created);
}
