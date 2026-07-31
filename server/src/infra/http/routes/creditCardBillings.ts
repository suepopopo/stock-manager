import type { FastifyInstance } from "fastify";
import { listCreditCardBillings } from "../../../usecase/listCreditCardBillings.js";
import { upsertCreditCardBilling } from "../../../usecase/upsertCreditCardBilling.js";
import type { CreditCardBillingRepository, NewCreditCardBilling } from "../../../usecase/ports.js";

const upsertBodySchema = {
  type: "object",
  required: ["creditCardId", "billingYearMonth", "billedAmount"],
  properties: {
    creditCardId: { type: "integer" },
    billingYearMonth: { type: "string", format: "date" },
    billedAmount: { type: "integer" },
  },
} as const;

// カード×請求年月のマトリクス台帳（要件定義書 §3.3.3）。同一カード・同一年月への登録は上書きになる。
export async function registerCreditCardBillingRoutes(
  app: FastifyInstance,
  repository: CreditCardBillingRepository,
): Promise<void> {
  app.get("/api/credit-card-billings", async () => listCreditCardBillings(repository));

  app.put<{ Body: NewCreditCardBilling }>(
    "/api/credit-card-billings",
    { schema: { body: upsertBodySchema } },
    async (request) => upsertCreditCardBilling(repository, request.body),
  );
}
