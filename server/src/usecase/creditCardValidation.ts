import { accounts } from "../config/accounts.js";
import { creditCardBrands } from "../config/creditCardBrands.js";
import { DomainValidationError } from "../domain/errors.js";
import type { CreditCardStatus } from "./ports.js";

const CREDIT_CARD_STATUSES = ["契約中", "解約済"] as const;

export function validateAccountKey(accountKey: string): void {
  if (!accounts.some((a) => a.key === accountKey)) {
    throw new DomainValidationError(`unknown accountKey: ${accountKey}`);
  }
}

export function validateBrandKey(brandKey: string): void {
  if (!creditCardBrands.some((b) => b.key === brandKey)) {
    throw new DomainValidationError(`unknown brandKey: ${brandKey}`);
  }
}

export function validateStatus(status: CreditCardStatus): void {
  if (!CREDIT_CARD_STATUSES.includes(status)) {
    throw new DomainValidationError(`unknown status: ${status}`);
  }
}
