import type { FastifyInstance } from "fastify";
import { deleteEntity } from "../../../usecase/deleteEntity.js";
import { listSalesChannels } from "../../../usecase/listSalesChannels.js";
import { registerSalesChannel } from "../../../usecase/registerSalesChannel.js";
import { updateSalesChannel } from "../../../usecase/updateSalesChannel.js";
import type { SalesChannelRepository } from "../../../usecase/ports.js";

const createSalesChannelBodySchema = {
  type: "object",
  required: ["companyName", "shopName"],
  properties: {
    corporateNumber: { type: "string" },
    companyName: { type: "string", minLength: 1 },
    shopName: { type: "string", minLength: 1 },
  },
} as const;

const updateSalesChannelBodySchema = {
  type: "object",
  properties: {
    corporateNumber: { type: "string" },
    companyName: { type: "string", minLength: 1 },
    shopName: { type: "string", minLength: 1 },
  },
} as const;

export async function registerSalesChannelRoutes(
  app: FastifyInstance,
  repository: SalesChannelRepository,
): Promise<void> {
  app.get("/api/sales-channels", async () => listSalesChannels(repository));

  app.post<{
    Body: { corporateNumber?: string; companyName: string; shopName: string };
  }>(
    "/api/sales-channels",
    { schema: { body: createSalesChannelBodySchema } },
    async (request, reply) => {
      const created = await registerSalesChannel(repository, request.body);
      reply.code(201);
      return created;
    },
  );

  app.patch<{
    Params: { id: string };
    Body: { corporateNumber?: string; companyName?: string; shopName?: string };
  }>(
    "/api/sales-channels/:id",
    { schema: { body: updateSalesChannelBodySchema } },
    async (request) => updateSalesChannel(repository, Number(request.params.id), request.body),
  );

  app.delete<{ Params: { id: string } }>("/api/sales-channels/:id", async (request, reply) => {
    await deleteEntity(repository, Number(request.params.id));
    reply.code(204);
  });
}
