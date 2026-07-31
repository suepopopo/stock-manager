import type { FastifyInstance } from "fastify";
import { accounts } from "../../../config/accounts.js";
import { creditCardBrands } from "../../../config/creditCardBrands.js";
import { purchaseSites } from "../../../config/purchaseSites.js";
import { purchaseTypes } from "../../../config/purchaseTypes.js";

// フロントエンドの選択肢表示用に、設定ファイル（要件定義書 §0.2）の内容をそのまま返す。
export async function registerConfigRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/config/accounts", async () => accounts);
  app.get("/api/config/credit-card-brands", async () => creditCardBrands);
  app.get("/api/config/purchase-types", async () => purchaseTypes);
  app.get("/api/config/purchase-sites", async () => purchaseSites);
}
