import { isValidYearMonth } from "../domain/monthRange.js";
import { DomainValidationError } from "../domain/errors.js";
import type { MonthlySummary, MonthlySummaryRepository } from "./ports.js";

export function getMonthlySummary(
  repository: MonthlySummaryRepository,
  yearMonth: string,
): Promise<MonthlySummary> {
  if (!isValidYearMonth(yearMonth)) {
    throw new DomainValidationError(`invalid yearMonth: ${yearMonth} (expected YYYY-MM)`);
  }
  return repository.findByMonth(yearMonth);
}
