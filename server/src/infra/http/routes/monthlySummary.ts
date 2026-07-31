import type { FastifyInstance } from "fastify";
import { getMonthlySummary } from "../../../usecase/getMonthlySummary.js";
import type { MonthlySummaryRepository } from "../../../usecase/ports.js";

const querySchema = {
  type: "object",
  required: ["yearMonth"],
  properties: {
    yearMonth: { type: "string" },
  },
} as const;

export async function registerMonthlySummaryRoutes(
  app: FastifyInstance,
  repository: MonthlySummaryRepository,
): Promise<void> {
  app.get<{ Querystring: { yearMonth: string } }>(
    "/api/monthly-summary",
    { schema: { querystring: querySchema } },
    async (request) => getMonthlySummary(repository, request.query.yearMonth),
  );
}
