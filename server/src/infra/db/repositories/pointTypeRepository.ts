import { eq } from "drizzle-orm";
import type { NewSimpleMaster, SimpleMasterRepository } from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { pointTypes } from "../schema.js";

export function createPointTypeRepository(db: typeof Db): SimpleMasterRepository {
  return {
    async findAll() {
      return db.select().from(pointTypes).where(eq(pointTypes.deleteFlag, false));
    },

    async create(input: NewSimpleMaster) {
      const rows = await db.insert(pointTypes).values({ name: input.name }).returning();
      return rows[0];
    },

    async update(id: number, patch: Partial<NewSimpleMaster>) {
      const rows = await db
        .update(pointTypes)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(pointTypes.id, id))
        .returning();
      return rows[0];
    },

    async remove(id: number) {
      await db
        .update(pointTypes)
        .set({ deleteFlag: true, updatedAt: new Date() })
        .where(eq(pointTypes.id, id));
    },
  };
}
