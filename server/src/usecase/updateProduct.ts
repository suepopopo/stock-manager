import type { NewProduct, Product, ProductRepository } from "./ports.js";

export function updateProduct(
  repository: ProductRepository,
  id: number,
  patch: Partial<NewProduct>,
): Promise<Product> {
  return repository.update(id, patch);
}
