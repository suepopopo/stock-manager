import type { NewSalesChannel, SalesChannel, SalesChannelRepository } from "./ports.js";

export function updateSalesChannel(
  repository: SalesChannelRepository,
  id: number,
  patch: Partial<NewSalesChannel>,
): Promise<SalesChannel> {
  return repository.update(id, patch);
}
