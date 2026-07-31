import type { NewProduct, Product, ProductRepository } from "./ports.js";

// JANコードが入力された場合、同一JANの既存商品があればそれに紐付ける（要件定義書 §3.2 備考）。
export async function registerProduct(
  repository: ProductRepository,
  input: NewProduct,
): Promise<Product> {
  if (input.janCode) {
    const existing = await repository.findByJanCode(input.janCode);
    if (existing) {
      return existing;
    }
  }
  return repository.create(input);
}
