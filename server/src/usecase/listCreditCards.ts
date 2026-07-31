import type { CreditCard, CreditCardRepository } from "./ports.js";

export function listCreditCards(repository: CreditCardRepository): Promise<CreditCard[]> {
  return repository.findAll();
}
