import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const commonColumns = {
  id: serial("id").primaryKey(),
  deleteFlag: boolean("delete_flag").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
};

// 商品マスタ（要件定義書 §3.2）
export const products = pgTable(
  "products",
  {
    ...commonColumns,
    name: varchar("name").notNull(),
    shortName: varchar("short_name"),
    janCode: varchar("jan_code"),
    category: varchar("category"),
  },
  (table) => [
    uniqueIndex("products_jan_code_unique")
      .on(table.janCode)
      .where(sql`${table.deleteFlag} = false`),
  ],
);

// 仕入れ先マスタ（要件定義書 §3.5、②仕入れ先名のみ）
export const shops = pgTable("shops", {
  ...commonColumns,
  name: varchar("name").notNull(),
});

// 販売先マスタ（要件定義書 §3.4）
export const salesChannels = pgTable("sales_channels", {
  ...commonColumns,
  corporateNumber: varchar("corporate_number"),
  companyName: varchar("company_name").notNull(),
  shopName: varchar("shop_name").notNull(),
});

// 支払い方法マスタ（要件定義書 §3.3）
export const paymentMethods = pgTable("payment_methods", {
  ...commonColumns,
  name: varchar("name").notNull(),
});

// ポイント種別マスタ（要件定義書 §3.6）
export const pointTypes = pgTable("point_types", {
  ...commonColumns,
  name: varchar("name").notNull(),
});

// クレジットカードマスタ（要件定義書 §3.3.1）
export const creditCards = pgTable("credit_cards", {
  ...commonColumns,
  accountKey: varchar("account_key").notNull(),
  brandKey: varchar("brand_key").notNull(),
  cardName: varchar("card_name").notNull(),
  cardLast4: varchar("card_last4", { length: 4 }),
  displayName: varchar("display_name").notNull(),
  holderName: varchar("holder_name").notNull(),
  status: varchar("status").notNull(),
  joinedDate: date("joined_date").notNull(),
  canceledDate: date("canceled_date"),
  annualFeeFlag: boolean("annual_fee_flag").notNull().default(false),
  annualFeeAmount: integer("annual_fee_amount"),
  annualFeePaymentDay: integer("annual_fee_payment_day"),
  memo: text("memo"),
});

// クレジットカード請求額（要件定義書 §3.3.3）
export const creditCardBillings = pgTable("credit_card_billings", {
  ...commonColumns,
  creditCardId: integer("credit_card_id")
    .notNull()
    .references(() => creditCards.id),
  billingYearMonth: date("billing_year_month").notNull(),
  billedAmount: integer("billed_amount").notNull(),
});

// 購入商品登録（要件定義書 §3.7・§3.8、メインテーブル）
export const stockItems = pgTable("stock_items", {
  ...commonColumns,
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  groupId: varchar("group_id"),
  accountKey: varchar("account_key").notNull(),
  purchaseTypeKey: varchar("purchase_type_key").notNull(),
  purchaseSiteKey: varchar("purchase_site_key"),
  shopId: integer("shop_id")
    .notNull()
    .references(() => shops.id),
  purchasePrice: integer("purchase_price").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  pointRewardTotal: integer("point_reward_total").notNull().default(0),
  netPurchasePrice: integer("net_purchase_price").notNull(),
  salesChannelId: integer("sales_channel_id").references(() => salesChannels.id),
  salesPrice: integer("sales_price"),
  salesDate: date("sales_date"),
  profit: integer("profit"),
  profitRate: numeric("profit_rate", { precision: 6, scale: 2 }),
  arrivedFlag: boolean("arrived_flag").notNull().default(false),
  soldFlag: boolean("sold_flag").notNull().default(false),
  memo: text("memo"),
});

// 支払い内訳（要件定義書 §3.3.2、stock_itemsに対して1対多）
export const paymentDetails = pgTable("payment_details", {
  ...commonColumns,
  stockItemId: integer("stock_item_id")
    .notNull()
    .references(() => stockItems.id),
  paymentMethodId: integer("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id),
  amount: integer("amount").notNull(),
  creditCardId: integer("credit_card_id").references(() => creditCards.id),
  pointTypeId: integer("point_type_id").references(() => pointTypes.id),
  memo: text("memo"),
});

// ポイント内訳（要件定義書 §3.7、stock_itemsに対して1対多）
export const pointDetails = pgTable("point_details", {
  ...commonColumns,
  stockItemId: integer("stock_item_id")
    .notNull()
    .references(() => stockItems.id),
  pointTypeId: integer("point_type_id")
    .notNull()
    .references(() => pointTypes.id),
  amount: integer("amount").notNull(),
});
