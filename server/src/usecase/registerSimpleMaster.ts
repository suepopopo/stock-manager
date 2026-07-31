import type { NewSimpleMaster, SimpleMaster, SimpleMasterRepository } from "./ports.js";

export function registerSimpleMaster(
  repository: SimpleMasterRepository,
  input: NewSimpleMaster,
): Promise<SimpleMaster> {
  return repository.create(input);
}
