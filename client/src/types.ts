// サーバー側 usecase/ports.ts の型をフロントエンド用に写したもの。

export type SimpleMaster = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  shortName: string | null;
  janCode: string | null;
  category: string | null;
};

export type SalesChannel = {
  id: number;
  corporateNumber: string | null;
  companyName: string;
  shopName: string;
};

export type CreditCardStatus = "契約中" | "解約済";

export type CreditCard = {
  id: number;
  accountKey: string;
  brandKey: string;
  cardName: string;
  cardLast4: string | null;
  displayName: string;
  holderName: string;
  status: CreditCardStatus;
  joinedDate: string;
  canceledDate: string | null;
  annualFeeFlag: boolean;
  annualFeeAmount: number | null;
  annualFeePaymentDay: number | null;
  memo: string | null;
};

export type CreditCardBilling = {
  id: number;
  creditCardId: number;
  billingYearMonth: string;
  billedAmount: number;
};

export type ConfigEntry = {
  key: string;
  label: string;
};

export type StockItemStatus = "到着待ち" | "保有中" | "売却済み";

export type PaymentDetail = {
  paymentMethodId: number;
  amount: number;
  creditCardId?: number | null;
  pointTypeId?: number | null;
  memo?: string | null;
};

export type PointDetail = {
  pointTypeId: number;
  amount: number;
};

export type StockItem = {
  id: number;
  productId: number;
  groupId: string | null;
  accountKey: string;
  purchaseTypeKey: string;
  purchaseSiteKey: string | null;
  shopId: number;
  purchasePrice: number;
  purchaseDate: string;
  pointRewardTotal: number;
  netPurchasePrice: number;
  salesChannelId: number | null;
  salesPrice: number | null;
  salesDate: string | null;
  profit: number | null;
  profitRate: number | null;
  arrivedFlag: boolean;
  soldFlag: boolean;
  memo: string | null;
  status: StockItemStatus;
};

export type NewStockItem = {
  productId: number;
  groupId?: string | null;
  accountKey: string;
  purchaseTypeKey: string;
  purchaseSiteKey?: string | null;
  shopId: number;
  purchasePrice: number;
  purchaseDate: string;
  arrivedFlag?: boolean;
  memo?: string | null;
  paymentDetails: PaymentDetail[];
  pointDetails: PointDetail[];
};

export type StockItemSaleUpdate = {
  salesChannelId?: number | null;
  salesPrice?: number | null;
  salesDate?: string | null;
  arrivedFlag?: boolean;
  soldFlag?: boolean;
};

export type MonthlySummary = {
  yearMonth: string;
  purchaseTotal: number;
  salesTotal: number;
  profitTotal: number;
};
