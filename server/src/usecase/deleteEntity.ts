// products / shops / payment_methods / point_types / sales_channels / credit_cards / stock_items
// いずれも論理削除（delete_flag更新）のみで、ドメイン固有の削除ルールを持たないため共通化する。
export interface Removable {
  remove(id: number): Promise<void>;
}

export function deleteEntity(repository: Removable, id: number): Promise<void> {
  return repository.remove(id);
}
