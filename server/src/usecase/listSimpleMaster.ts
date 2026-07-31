import type { SimpleMaster, SimpleMasterRepository } from "./ports.js";

export function listSimpleMaster(repository: SimpleMasterRepository): Promise<SimpleMaster[]> {
  return repository.findAll();
}
