import type { Product, ProductRepository } from "./ports.js";

export function listProducts(repository: ProductRepository): Promise<Product[]> {
  return repository.findAll();
}
