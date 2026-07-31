import type { FastifyInstance } from "fastify";
import { deleteEntity } from "../../../usecase/deleteEntity.js";
import { listStockItems } from "../../../usecase/listStockItems.js";
import { recordStockItemSale } from "../../../usecase/recordStockItemSale.js";
import { registerStockItem } from "../../../usecase/registerStockItem.js";
import type { NewStockItem, StockItemRepository, StockItemSaleUpdate } from "../../../usecase/ports.js";

const paymentDetailSchema = {
  type: "object",
  required: ["paymentMethodId", "amount"],
  properties: {
    paymentMethodId: { type: "integer" },
    amount: { type: "integer" },
    creditCardId: { type: "integer" },
    pointTypeId: { type: "integer" },
    memo: { type: "string" },
  },
} as const;

const pointDetailSchema = {
  type: "object",
  required: ["pointTypeId", "amount"],
  properties: {
    pointTypeId: { type: "integer" },
    amount: { type: "integer" },
  },
} as const;

const createStockItemBodySchema = {
  type: "object",
  required: [
    "productId",
    "accountKey",
    "purchaseTypeKey",
    "shopId",
    "purchasePrice",
    "purchaseDate",
    "paymentDetails",
    "pointDetails",
  ],
  properties: {
    productId: { type: "integer" },
    groupId: { type: "string" },
    accountKey: { type: "string", minLength: 1 },
    purchaseTypeKey: { type: "string", minLength: 1 },
    purchaseSiteKey: { type: "string" },
    shopId: { type: "integer" },
    purchasePrice: { type: "integer" },
    purchaseDate: { type: "string", format: "date" },
    arrivedFlag: { type: "boolean" },
    memo: { type: "string" },
    paymentDetails: { type: "array", items: paymentDetailSchema, minItems: 1 },
    pointDetails: { type: "array", items: pointDetailSchema },
  },
} as const;

const recordSaleBodySchema = {
  type: "object",
  properties: {
    salesChannelId: { type: "integer" },
    salesPrice: { type: "integer" },
    salesDate: { type: "string", format: "date" },
    arrivedFlag: { type: "boolean" },
    soldFlag: { type: "boolean" },
  },
} as const;

export async function registerStockItemRoutes(
  app: FastifyInstance,
  repository: StockItemRepository,
): Promise<void> {
  app.get("/api/stock-items", async () => listStockItems(repository));

  app.post<{ Body: NewStockItem }>(
    "/api/stock-items",
    { schema: { body: createStockItemBodySchema } },
    async (request, reply) => {
      const created = await registerStockItem(repository, request.body);
      reply.code(201);
      return created;
    },
  );

  app.patch<{ Params: { id: string }; Body: StockItemSaleUpdate }>(
    "/api/stock-items/:id/sale",
    { schema: { body: recordSaleBodySchema } },
    async (request) => recordStockItemSale(repository, Number(request.params.id), request.body),
  );

  app.delete<{ Params: { id: string } }>("/api/stock-items/:id", async (request, reply) => {
    await deleteEntity(repository, Number(request.params.id));
    reply.code(204);
  });
}
