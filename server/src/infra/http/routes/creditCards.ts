import type { FastifyInstance } from "fastify";
import { deleteEntity } from "../../../usecase/deleteEntity.js";
import { listCreditCards } from "../../../usecase/listCreditCards.js";
import { registerCreditCard } from "../../../usecase/registerCreditCard.js";
import { updateCreditCard } from "../../../usecase/updateCreditCard.js";
import type { CreditCardRepository, NewCreditCard } from "../../../usecase/ports.js";

const createCreditCardBodySchema = {
  type: "object",
  required: [
    "accountKey",
    "brandKey",
    "cardName",
    "displayName",
    "holderName",
    "status",
    "joinedDate",
    "annualFeeFlag",
  ],
  properties: {
    accountKey: { type: "string", minLength: 1 },
    brandKey: { type: "string", minLength: 1 },
    cardName: { type: "string", minLength: 1 },
    cardLast4: { type: "string", maxLength: 4 },
    displayName: { type: "string", minLength: 1 },
    holderName: { type: "string", minLength: 1 },
    status: { type: "string", enum: ["契約中", "解約済"] },
    joinedDate: { type: "string", format: "date" },
    canceledDate: { type: "string", format: "date" },
    annualFeeFlag: { type: "boolean" },
    annualFeeAmount: { type: "integer" },
    annualFeePaymentDay: { type: "integer", minimum: 1, maximum: 31 },
    memo: { type: "string" },
  },
} as const;

export async function registerCreditCardRoutes(
  app: FastifyInstance,
  repository: CreditCardRepository,
): Promise<void> {
  app.get("/api/credit-cards", async () => listCreditCards(repository));

  app.post<{ Body: NewCreditCard }>(
    "/api/credit-cards",
    { schema: { body: createCreditCardBodySchema } },
    async (request, reply) => {
      const created = await registerCreditCard(repository, request.body);
      reply.code(201);
      return created;
    },
  );

  app.patch<{ Params: { id: string }; Body: Partial<NewCreditCard> }>(
    "/api/credit-cards/:id",
    { schema: { body: { ...createCreditCardBodySchema, required: [] } } },
    async (request) => updateCreditCard(repository, Number(request.params.id), request.body),
  );

  app.delete<{ Params: { id: string } }>("/api/credit-cards/:id", async (request, reply) => {
    await deleteEntity(repository, Number(request.params.id));
    reply.code(204);
  });
}
