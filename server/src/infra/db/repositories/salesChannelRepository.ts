import { eq } from "drizzle-orm";
import type {
  NewSalesChannel,
  SalesChannel,
  SalesChannelRepository,
} from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { salesChannels } from "../schema.js";

export function createSalesChannelRepository(db: typeof Db): SalesChannelRepository {
  return {
    async findAll() {
      return db.select().from(salesChannels).where(eq(salesChannels.deleteFlag, false));
    },

    async create(input: NewSalesChannel): Promise<SalesChannel> {
      const rows = await db
        .insert(salesChannels)
        .values({
          corporateNumber: input.corporateNumber ?? null,
          companyName: input.companyName,
          shopName: input.shopName,
        })
        .returning();
      return rows[0];
    },

    async update(id: number, patch: Partial<NewSalesChannel>): Promise<SalesChannel> {
      const rows = await db
        .update(salesChannels)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(salesChannels.id, id))
        .returning();
      return rows[0];
    },

    async remove(id: number): Promise<void> {
      await db
        .update(salesChannels)
        .set({ deleteFlag: true, updatedAt: new Date() })
        .where(eq(salesChannels.id, id));
    },
  };
}
