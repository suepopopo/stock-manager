import type {
  CreditCardBilling,
  CreditCardBillingRepository,
  NewCreditCardBilling,
} from "./ports.js";

export function upsertCreditCardBilling(
  repository: CreditCardBillingRepository,
  input: NewCreditCardBilling,
): Promise<CreditCardBilling> {
  return repository.upsert(input);
}
