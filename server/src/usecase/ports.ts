// ユースケース層から見た依存先（DBアクセス等）のインターフェース。
// 実装はinfra層に置き、依存性逆転させる（簡略クリーンアーキテクチャ）。

export type Product = {
  id: number;
  name: string;
  shortName: string | null;
  janCode: string | null;
  category: string | null;
};

export type NewProduct = {
  name: string;
  shortName?: string | null;
  janCode?: string | null;
  category?: string | null;
};

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findByJanCode(janCode: string): Promise<Product | null>;
  create(product: NewProduct): Promise<Product>;
  update(id: number, patch: Partial<NewProduct>): Promise<Product>;
  remove(id: number): Promise<void>;
}

// 名前だけを持つ単純なマスタ（payment_methods / point_types / shops）に共通のインターフェース。
export type SimpleMaster = {
  id: number;
  name: string;
};

export type NewSimpleMaster = {
  name: string;
};

export interface SimpleMasterRepository {
  findAll(): Promise<SimpleMaster[]>;
  create(input: NewSimpleMaster): Promise<SimpleMaster>;
  update(id: number, patch: Partial<NewSimpleMaster>): Promise<SimpleMaster>;
  remove(id: number): Promise<void>;
}

export type SalesChannel = {
  id: number;
  corporateNumber: string | null;
  companyName: string;
  shopName: string;
};

export type NewSalesChannel = {
  corporateNumber?: string | null;
  companyName: string;
  shopName: string;
};

export interface SalesChannelRepository {
  findAll(): Promise<SalesChannel[]>;
  create(input: NewSalesChannel): Promise<SalesChannel>;
  update(id: number, patch: Partial<NewSalesChannel>): Promise<SalesChannel>;
  remove(id: number): Promise<void>;
}

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

export type NewCreditCard = {
  accountKey: string;
  brandKey: string;
  cardName: string;
  cardLast4?: string | null;
  displayName: string;
  holderName: string;
  status: CreditCardStatus;
  joinedDate: string;
  canceledDate?: string | null;
  annualFeeFlag: boolean;
  annualFeeAmount?: number | null;
  annualFeePaymentDay?: number | null;
  memo?: string | null;
};

export interface CreditCardRepository {
  findAll(): Promise<CreditCard[]>;
  create(input: NewCreditCard): Promise<CreditCard>;
  update(id: number, patch: Partial<NewCreditCard>): Promise<CreditCard>;
  remove(id: number): Promise<void>;
}

export type CreditCardBilling = {
  id: number;
  creditCardId: number;
  billingYearMonth: string;
  billedAmount: number;
};

export type NewCreditCardBilling = {
  creditCardId: number;
  billingYearMonth: string;
  billedAmount: number;
};

export interface CreditCardBillingRepository {
  findAll(): Promise<CreditCardBilling[]>;
  // 同一カード・同一請求年月の行が既にあれば金額を更新し、なければ新規作成する（要件定義書 §3.3.3）。
  upsert(input: NewCreditCardBilling): Promise<CreditCardBilling>;
}

export type NewPointDetail = {
  pointTypeId: number;
  amount: number;
};

export type NewPaymentDetail = {
  paymentMethodId: number;
  amount: number;
  creditCardId?: number | null;
  pointTypeId?: number | null;
  memo?: string | null;
};

// stock_itemsの生カラム（ステータスはDBに持たず派生値のため含まない）。
export type StockItemRecord = {
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
};

// 購入商品登録の新規入力。point_reward_total / net_purchase_price / profit / profit_rate は
// アプリ側（ユースケース層）で算出するため入力には含めない（要件定義書 §3.7・§3.8）。
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
  paymentDetails: NewPaymentDetail[];
  pointDetails: NewPointDetail[];
};

// 到着・売却の記録用の更新入力。値を渡した項目だけ更新する。
export type StockItemSaleUpdate = {
  salesChannelId?: number | null;
  salesPrice?: number | null;
  salesDate?: string | null;
  arrivedFlag?: boolean;
  soldFlag?: boolean;
};

export interface StockItemRepository {
  findAll(): Promise<StockItemRecord[]>;
  findById(id: number): Promise<StockItemRecord | null>;
  create(input: {
    stockItem: Omit<StockItemRecord, "id">;
    paymentDetails: NewPaymentDetail[];
    pointDetails: NewPointDetail[];
  }): Promise<StockItemRecord>;
  updateSaleInfo(
    id: number,
    patch: Pick<
      StockItemRecord,
      "salesChannelId" | "salesPrice" | "salesDate" | "arrivedFlag" | "soldFlag" | "profit" | "profitRate"
    >,
  ): Promise<StockItemRecord>;
  remove(id: number): Promise<void>;
}

// 月次収益確認（要件定義書 §3.9）。仕入れ合計額は仕入れ日基準、売上・利益合計額は販売日基準で集計する。
export type MonthlySummary = {
  yearMonth: string;
  purchaseTotal: number;
  salesTotal: number;
  profitTotal: number;
};

export interface MonthlySummaryRepository {
  findByMonth(yearMonth: string): Promise<MonthlySummary>;
}
