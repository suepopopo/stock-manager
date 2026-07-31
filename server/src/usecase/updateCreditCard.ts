import type { CreditCard, CreditCardRepository, NewCreditCard } from "./ports.js";
import { validateAccountKey, validateBrandKey, validateStatus } from "./creditCardValidation.js";

export async function updateCreditCard(
  repository: CreditCardRepository,
  id: number,
  patch: Partial<NewCreditCard>,
): Promise<CreditCard> {
  if (patch.accountKey !== undefined) {
    validateAccountKey(patch.accountKey);
  }
  if (patch.brandKey !== undefined) {
    validateBrandKey(patch.brandKey);
  }
  if (patch.status !== undefined) {
    validateStatus(patch.status);
  }

  return repository.update(id, patch);
}
