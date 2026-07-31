import { and, eq } from "drizzle-orm";
import type { NewProduct, Product, ProductRepository } from "../../../usecase/ports.js";
import type { db as Db } from "../client.js";
import { products } from "../schema.js";

export function createProductRepository(db: typeof Db): ProductRepository {
  return {
    async findAll() {
      return db.select().from(products).where(eq(products.deleteFlag, false));
    },

    async findByJanCode(janCode: string) {
      const rows = await db
        .select()
        .from(products)
        .where(and(eq(products.janCode, janCode), eq(products.deleteFlag, false)))
        .limit(1);
      return rows[0] ?? null;
    },

    async create(product: NewProduct): Promise<Product> {
      const rows = await db
        .insert(products)
        .values({
          name: product.name,
          shortName: product.shortName ?? null,
          janCode: product.janCode ?? null,
          category: product.category ?? null,
        })
        .returning();
      return rows[0];
    },

    async update(id: number, patch: Partial<NewProduct>): Promise<Product> {
      const rows = await db
        .update(products)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return rows[0];
    },

    async remove(id: number): Promise<void> {
      await db
        .update(products)
        .set({ deleteFlag: true, updatedAt: new Date() })
        .where(eq(products.id, id));
    },
  };
}
