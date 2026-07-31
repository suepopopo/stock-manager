import type { FastifyInstance } from "fastify";
import { deleteEntity } from "../../../usecase/deleteEntity.js";
import { listSimpleMaster } from "../../../usecase/listSimpleMaster.js";
import { registerSimpleMaster } from "../../../usecase/registerSimpleMaster.js";
import { updateSimpleMaster } from "../../../usecase/updateSimpleMaster.js";
import type { SimpleMasterRepository } from "../../../usecase/ports.js";

const createSimpleMasterBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1 },
  },
} as const;

const updateSimpleMasterBodySchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
  },
} as const;

// payment_methods / point_types / shops など「名前だけ」のマスタで共通のCRUD（一覧・登録・編集・削除）。
export async function registerSimpleMasterRoutes(
  app: FastifyInstance,
  basePath: string,
  repository: SimpleMasterRepository,
): Promise<void> {
  app.get(basePath, async () => listSimpleMaster(repository));

  app.post<{ Body: { name: string } }>(
    basePath,
    { schema: { body: createSimpleMasterBodySchema } },
    async (request, reply) => {
      const created = await registerSimpleMaster(repository, request.body);
      reply.code(201);
      return created;
    },
  );

  app.patch<{ Params: { id: string }; Body: { name?: string } }>(
    `${basePath}/:id`,
    { schema: { body: updateSimpleMasterBodySchema } },
    async (request) => updateSimpleMaster(repository, Number(request.params.id), request.body),
  );

  app.delete<{ Params: { id: string } }>(`${basePath}/:id`, async (request, reply) => {
    await deleteEntity(repository, Number(request.params.id));
    reply.code(204);
  });
}
