CREATE TABLE "credit_card_billings" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"credit_card_id" integer NOT NULL,
	"billing_year_month" date NOT NULL,
	"billed_amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"account_key" varchar NOT NULL,
	"brand_key" varchar NOT NULL,
	"card_name" varchar NOT NULL,
	"card_last4" varchar(4),
	"display_name" varchar NOT NULL,
	"holder_name" varchar NOT NULL,
	"status" varchar NOT NULL,
	"joined_date" date NOT NULL,
	"canceled_date" date,
	"annual_fee_flag" boolean DEFAULT false NOT NULL,
	"annual_fee_amount" integer,
	"annual_fee_payment_day" integer,
	"memo" text
);
--> statement-breakpoint
CREATE TABLE "payment_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stock_item_id" integer NOT NULL,
	"payment_method_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"credit_card_id" integer,
	"point_type_id" integer,
	"memo" text
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stock_item_id" integer NOT NULL,
	"point_type_id" integer NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar NOT NULL,
	"short_name" varchar,
	"jan_code" varchar,
	"category" varchar
);
--> statement-breakpoint
CREATE TABLE "sales_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"corporate_number" varchar,
	"company_name" varchar NOT NULL,
	"shop_name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"delete_flag" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" integer NOT NULL,
	"group_id" varchar,
	"account_key" varchar NOT NULL,
	"purchase_type_key" varchar NOT NULL,
	"purchase_site_key" varchar,
	"shop_id" integer NOT NULL,
	"purchase_price" integer NOT NULL,
	"purchase_date" date NOT NULL,
	"point_reward_total" integer DEFAULT 0 NOT NULL,
	"net_purchase_price" integer NOT NULL,
	"sales_channel_id" integer,
	"sales_price" integer,
	"sales_date" date,
	"profit" integer,
	"profit_rate" numeric(6, 2),
	"arrived_flag" boolean DEFAULT false NOT NULL,
	"sold_flag" boolean DEFAULT false NOT NULL,
	"memo" text
);
--> statement-breakpoint
ALTER TABLE "credit_card_billings" ADD CONSTRAINT "credit_card_billings_credit_card_id_credit_cards_id_fk" FOREIGN KEY ("credit_card_id") REFERENCES "public"."credit_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_credit_card_id_credit_cards_id_fk" FOREIGN KEY ("credit_card_id") REFERENCES "public"."credit_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_point_type_id_point_types_id_fk" FOREIGN KEY ("point_type_id") REFERENCES "public"."point_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_details" ADD CONSTRAINT "point_details_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_details" ADD CONSTRAINT "point_details_point_type_id_point_types_id_fk" FOREIGN KEY ("point_type_id") REFERENCES "public"."point_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_sales_channel_id_sales_channels_id_fk" FOREIGN KEY ("sales_channel_id") REFERENCES "public"."sales_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "products_jan_code_unique" ON "products" USING btree ("jan_code") WHERE "products"."delete_flag" = false;