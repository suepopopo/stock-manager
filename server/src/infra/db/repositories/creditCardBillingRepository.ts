import { and, eq } from "drizzle-orm";
import type {
  CreditCardBilling,
  CreditCardBillingRepository,
  NewCreditCardBilling,
} from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { creditCardBillings } from "../schema.js";

export function createCreditCardBillingRepository(db: typeof Db): CreditCardBillingRepository {
  return {
    async findAll() {
      const rows = await db
        .select()
        .from(creditCardBillings)
        .where(eq(creditCardBillings.deleteFlag, false));
      return rows.map((row) => ({
        id: row.id,
        creditCardId: row.creditCardId,
        billingYearMonth: row.billingYearMonth,
        billedAmount: row.billedAmount,
      }));
    },

    async upsert(input: NewCreditCardBilling): Promise<CreditCardBilling> {
      const existing = await db
        .select()
        .from(creditCardBillings)
        .where(
          and(
            eq(creditCardBillings.creditCardId, input.creditCardId),
            eq(creditCardBillings.billingYearMonth, input.billingYearMonth),
            eq(creditCardBillings.deleteFlag, false),
          ),
        )
        .limit(1);

      if (existing[0]) {
        const updated = await db
          .update(creditCardBillings)
          .set({ billedAmount: input.billedAmount, updatedAt: new Date() })
          .where(eq(creditCardBillings.id, existing[0].id))
          .returning();
        return updated[0];
      }

      const created = await db.insert(creditCardBillings).values(input).returning();
      return created[0];
    },
  };
}
