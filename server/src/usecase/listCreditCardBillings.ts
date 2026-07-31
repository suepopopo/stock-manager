import type { CreditCardBilling, CreditCardBillingRepository } from "./ports.js";

export function listCreditCardBillings(
  repository: CreditCardBillingRepository,
): Promise<CreditCardBilling[]> {
  return repository.findAll();
}
