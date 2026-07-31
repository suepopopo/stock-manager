import { eq } from "drizzle-orm";
import type { NewSimpleMaster, SimpleMasterRepository } from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { shops } from "../schema.js";

export function createShopRepository(db: typeof Db): SimpleMasterRepository {
  return {
    async findAll() {
      return db.select().from(shops).where(eq(shops.deleteFlag, false));
    },

    async create(input: NewSimpleMaster) {
      const rows = await db.insert(shops).values({ name: input.name }).returning();
      return rows[0];
    },

    async update(id: number, patch: Partial<NewSimpleMaster>) {
      const rows = await db
        .update(shops)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(shops.id, id))
        .returning();
      return rows[0];
    },

    async remove(id: number) {
      await db.update(shops).set({ deleteFlag: true, updatedAt: new Date() }).where(eq(shops.id, id));
    },
  };
}
