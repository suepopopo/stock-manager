import { eq } from "drizzle-orm";
import type { NewSimpleMaster, SimpleMasterRepository } from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { paymentMethods } from "../schema.js";

export function createPaymentMethodRepository(db: typeof Db): SimpleMasterRepository {
  return {
    async findAll() {
      return db.select().from(paymentMethods).where(eq(paymentMethods.deleteFlag, false));
    },

    async create(input: NewSimpleMaster) {
      const rows = await db.insert(paymentMethods).values({ name: input.name }).returning();
      return rows[0];
    },

    async update(id: number, patch: Partial<NewSimpleMaster>) {
      const rows = await db
        .update(paymentMethods)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(paymentMethods.id, id))
        .returning();
      return rows[0];
    },

    async remove(id: number) {
      await db
        .update(paymentMethods)
        .set({ deleteFlag: true, updatedAt: new Date() })
        .where(eq(paymentMethods.id, id));
    },
  };
}
