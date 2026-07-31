import type { NewSimpleMaster, SimpleMaster, SimpleMasterRepository } from "./ports.js";

export function updateSimpleMaster(
  repository: SimpleMasterRepository,
  id: number,
  patch: Partial<NewSimpleMaster>,
): Promise<SimpleMaster> {
  return repository.update(id, patch);
}
