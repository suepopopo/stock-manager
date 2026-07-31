import type { SalesChannel, SalesChannelRepository } from "./ports.js";

export function listSalesChannels(repository: SalesChannelRepository): Promise<SalesChannel[]> {
  return repository.findAll();
}
