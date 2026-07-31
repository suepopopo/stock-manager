import type { CreditCard, CreditCardRepository, NewCreditCard } from "./ports.js";
import { validateAccountKey, validateBrandKey, validateStatus } from "./creditCardValidation.js";

export async function registerCreditCard(
  repository: CreditCardRepository,
  input: NewCreditCard,
): Promise<CreditCard> {
  validateAccountKey(input.accountKey);
  validateBrandKey(input.brandKey);
  validateStatus(input.status);

  return repository.create(input);
}
