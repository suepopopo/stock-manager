import { eq } from "drizzle-orm";
import type { CreditCard, CreditCardRepository, NewCreditCard } from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { creditCards } from "../schema.js";

export function createCreditCardRepository(db: typeof Db): CreditCardRepository {
  return {
    async findAll() {
      return db
        .select()
        .from(creditCards)
        .where(eq(creditCards.deleteFlag, false)) as unknown as Promise<CreditCard[]>;
    },

    async create(input: NewCreditCard): Promise<CreditCard> {
      const rows = await db
        .insert(creditCards)
        .values({
          accountKey: input.accountKey,
          brandKey: input.brandKey,
          cardName: input.cardName,
          cardLast4: input.cardLast4 ?? null,
          displayName: input.displayName,
          holderName: input.holderName,
          status: input.status,
          joinedDate: input.joinedDate,
          canceledDate: input.canceledDate ?? null,
          annualFeeFlag: input.annualFeeFlag,
          annualFeeAmount: input.annualFeeAmount ?? null,
          annualFeePaymentDay: input.annualFeePaymentDay ?? null,
          memo: input.memo ?? null,
        })
        .returning();
      return rows[0] as unknown as CreditCard;
    },

    async update(id: number, patch: Partial<NewCreditCard>): Promise<CreditCard> {
      const rows = await db
        .update(creditCards)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(creditCards.id, id))
        .returning();
      return rows[0] as unknown as CreditCard;
    },

    async remove(id: number): Promise<void> {
      await db
        .update(creditCards)
        .set({ deleteFlag: true, updatedAt: new Date() })
        .where(eq(creditCards.id, id));
    },
  };
}
