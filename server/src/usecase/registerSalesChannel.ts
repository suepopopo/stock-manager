import type { NewSalesChannel, SalesChannel, SalesChannelRepository } from "./ports.js";

export function registerSalesChannel(
  repository: SalesChannelRepository,
  input: NewSalesChannel,
): Promise<SalesChannel> {
  return repository.create(input);
}
