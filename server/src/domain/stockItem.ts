// 購入商品登録（stock_items）のドメインロジック（要件定義書 §3.7・§3.8）。
// DBやHTTPに依存しない純粋な計算ロジックのみを置く。

export type StockItemStatus = "到着待ち" | "保有中" | "売却済み";

export function calcPointRewardTotal(pointDetails: { amount: number }[]): number {
  return pointDetails.reduce((sum, detail) => sum + detail.amount, 0);
}

export function calcNetPurchasePrice(purchasePrice: number, pointRewardTotal: number): number {
  return purchasePrice - pointRewardTotal;
}

export function calcProfit(salesPrice: number | null, netPurchasePrice: number): number | null {
  if (salesPrice === null) {
    return null;
  }
  return salesPrice - netPurchasePrice;
}

export function calcProfitRate(profit: number | null, salesPrice: number | null): number | null {
  if (profit === null || salesPrice === null || salesPrice === 0) {
    return null;
  }
  return (profit / salesPrice) * 100;
}

export function deriveStatus(arrivedFlag: boolean, soldFlag: boolean): StockItemStatus {
  if (soldFlag) {
    return "売却済み";
  }
  if (arrivedFlag) {
    return "保有中";
  }
  return "到着待ち";
}

export type WithStatus<T> = T & { status: StockItemStatus };

// ステータスはDBに保持せず、到着済みチェック／売却チェックから読み取り時に付与する（要件定義書 §3.7）。
export function withStatus<T extends { arrivedFlag: boolean; soldFlag: boolean }>(
  record: T,
): WithStatus<T> {
  return { ...record, status: deriveStatus(record.arrivedFlag, record.soldFlag) };
}
