import type { FastifyInstance } from "fastify";
import { deleteEntity } from "../../../usecase/deleteEntity.js";
import { listProducts } from "../../../usecase/listProducts.js";
import { registerProduct } from "../../../usecase/registerProduct.js";
import { updateProduct } from "../../../usecase/updateProduct.js";
import type { ProductRepository } from "../../../usecase/ports.js";

const createProductBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1 },
    shortName: { type: "string" },
    janCode: { type: "string" },
    category: { type: "string" },
  },
} as const;

const updateProductBodySchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    shortName: { type: "string" },
    janCode: { type: "string" },
    category: { type: "string" },
  },
} as const;

export async function registerProductRoutes(
  app: FastifyInstance,
  productRepository: ProductRepository,
): Promise<void> {
  app.get("/api/products", async () => listProducts(productRepository));

  app.post<{
    Body: { name: string; shortName?: string; janCode?: string; category?: string };
  }>("/api/products", { schema: { body: createProductBodySchema } }, async (request, reply) => {
    const product = await registerProduct(productRepository, request.body);
    reply.code(201);
    return product;
  });

  app.patch<{
    Params: { id: string };
    Body: { name?: string; shortName?: string; janCode?: string; category?: string };
  }>(
    "/api/products/:id",
    { schema: { body: updateProductBodySchema } },
    async (request) => updateProduct(productRepository, Number(request.params.id), request.body),
  );

  app.delete<{ Params: { id: string } }>("/api/products/:id", async (request, reply) => {
    await deleteEntity(productRepository, Number(request.params.id));
    reply.code(204);
  });
}
