import Fastify, { type FastifyInstance } from "fastify";
import { DomainValidationError } from "../../domain/errors.js";
import { db } from "../db/client.js";
import { createCreditCardBillingRepository } from "../db/repositories/creditCardBillingRepository.js";
import { createCreditCardRepository } from "../db/repositories/creditCardRepository.js";
import { createPaymentMethodRepository } from "../db/repositories/paymentMethodRepository.js";
import { createPointTypeRepository } from "../db/repositories/pointTypeRepository.js";
import { createProductRepository } from "../db/repositories/productRepository.js";
import { createSalesChannelRepository } from "../db/repositories/salesChannelRepository.js";
import { createMonthlySummaryRepository } from "../db/repositories/monthlySummaryRepository.js";
import { createShopRepository } from "../db/repositories/shopRepository.js";
import { createStockItemRepository } from "../db/repositories/stockItemRepository.js";
import { registerBasicAuth } from "./middleware/basicAuth.js";
import { registerCreditCardBillingRoutes } from "./routes/creditCardBillings.js";
import { registerCreditCardRoutes } from "./routes/creditCards.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerMonthlySummaryRoutes } from "./routes/monthlySummary.js";
import { registerProductRoutes } from "./routes/products.js";
import { registerSalesChannelRoutes } from "./routes/salesChannels.js";
import { registerSimpleMasterRoutes } from "./routes/simpleMaster.js";
import { registerStockItemRoutes } from "./routes/stockItems.js";

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainValidationError) {
      reply.code(400).send({ message: error.message });
      return;
    }
    reply.send(error);
  });

  await registerBasicAuth(app);
  await registerHealthRoute(app);

  await registerProductRoutes(app, createProductRepository(db));
  await registerSalesChannelRoutes(app, createSalesChannelRepository(db));
  await registerSimpleMasterRoutes(app, "/api/payment-methods", createPaymentMethodRepository(db));
  await registerSimpleMasterRoutes(app, "/api/point-types", createPointTypeRepository(db));
  await registerSimpleMasterRoutes(app, "/api/shops", createShopRepository(db));
  await registerCreditCardRoutes(app, createCreditCardRepository(db));
  await registerCreditCardBillingRoutes(app, createCreditCardBillingRepository(db));
  await registerStockItemRoutes(app, createStockItemRepository(db));
  await registerMonthlySummaryRoutes(app, createMonthlySummaryRepository(db));

  return app;
}
