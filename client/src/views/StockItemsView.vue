<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { api } from "../api/client";
import type {
  ConfigEntry,
  CreditCard,
  NewStockItem,
  Product,
  SalesChannel,
  SimpleMaster,
  StockItem,
  StockItemSaleUpdate,
} from "../types";

type PaymentDetailForm = {
  paymentMethodId: number;
  amount: string;
  creditCardId: number | "";
  pointTypeId: number | "";
};

type PointDetailForm = {
  pointTypeId: number;
  amount: string;
};

const products = ref<Product[]>([]);
const shops = ref<SimpleMaster[]>([]);
const salesChannels = ref<SalesChannel[]>([]);
const paymentMethods = ref<SimpleMaster[]>([]);
const pointTypes = ref<SimpleMaster[]>([]);
const creditCards = ref<CreditCard[]>([]);
const accounts = ref<ConfigEntry[]>([]);
const purchaseTypes = ref<ConfigEntry[]>([]);
const purchaseSites = ref<ConfigEntry[]>([]);
const stockItems = ref<StockItem[]>([]);
const error = ref<string | null>(null);

function emptyForm() {
  return {
    productId: "",
    groupId: "",
    accountKey: "",
    purchaseTypeKey: "",
    purchaseSiteKey: "",
    shopId: "",
    purchasePrice: "",
    purchaseDate: "",
    memo: "",
    paymentDetails: [] as PaymentDetailForm[],
    pointDetails: [] as PointDetailForm[],
  };
}

const form = reactive(emptyForm());

function addPaymentDetail(): void {
  form.paymentDetails.push({ paymentMethodId: 0, amount: "", creditCardId: "", pointTypeId: "" });
}

function removePaymentDetail(index: number): void {
  form.paymentDetails.splice(index, 1);
}

function addPointDetail(): void {
  form.pointDetails.push({ pointTypeId: 0, amount: "" });
}

function removePointDetail(index: number): void {
  form.pointDetails.splice(index, 1);
}

async function loadMasters(): Promise<void> {
  const [
    productList,
    shopList,
    salesChannelList,
    paymentMethodList,
    pointTypeList,
    creditCardList,
    accountList,
    purchaseTypeList,
    purchaseSiteList,
  ] = await Promise.all([
    api.get<Product[]>("/api/products"),
    api.get<SimpleMaster[]>("/api/shops"),
    api.get<SalesChannel[]>("/api/sales-channels"),
    api.get<SimpleMaster[]>("/api/payment-methods"),
    api.get<SimpleMaster[]>("/api/point-types"),
    api.get<CreditCard[]>("/api/credit-cards"),
    api.get<ConfigEntry[]>("/api/config/accounts"),
    api.get<ConfigEntry[]>("/api/config/purchase-types"),
    api.get<ConfigEntry[]>("/api/config/purchase-sites"),
  ]);
  products.value = productList;
  shops.value = shopList;
  salesChannels.value = salesChannelList;
  paymentMethods.value = paymentMethodList;
  pointTypes.value = pointTypeList;
  creditCards.value = creditCardList;
  accounts.value = accountList;
  purchaseTypes.value = purchaseTypeList;
  purchaseSites.value = purchaseSiteList;
}

async function loadStockItems(): Promise<void> {
  stockItems.value = await api.get<StockItem[]>("/api/stock-items");
}

const isEc = computed(() => form.purchaseTypeKey === "ec");

async function submit(): Promise<void> {
  error.value = null;
  try {
    const payload: NewStockItem = {
      productId: Number(form.productId),
      groupId: form.groupId || undefined,
      accountKey: form.accountKey,
      purchaseTypeKey: form.purchaseTypeKey,
      purchaseSiteKey: isEc.value ? form.purchaseSiteKey || undefined : undefined,
      shopId: Number(form.shopId),
      purchasePrice: Number(form.purchasePrice),
      purchaseDate: form.purchaseDate,
      memo: form.memo || undefined,
      paymentDetails: form.paymentDetails.map((d) => ({
        paymentMethodId: Number(d.paymentMethodId),
        amount: Number(d.amount),
        creditCardId: d.creditCardId ? Number(d.creditCardId) : undefined,
        pointTypeId: d.pointTypeId ? Number(d.pointTypeId) : undefined,
      })),
      pointDetails: form.pointDetails.map((d) => ({
        pointTypeId: Number(d.pointTypeId),
        amount: Number(d.amount),
      })),
    };
    await api.post("/api/stock-items", payload);
    Object.assign(form, emptyForm());
    await loadStockItems();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function remove(id: number): Promise<void> {
  if (!confirm("削除しますか？")) return;
  error.value = null;
  try {
    await api.delete(`/api/stock-items/${id}`);
    await loadStockItems();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

const saleFormItemId = ref<number | null>(null);
const saleForm = reactive({
  salesChannelId: "",
  salesPrice: "",
  salesDate: "",
  arrivedFlag: false,
  soldFlag: false,
});

function openSaleForm(item: StockItem): void {
  saleFormItemId.value = item.id;
  saleForm.salesChannelId = item.salesChannelId?.toString() ?? "";
  saleForm.salesPrice = item.salesPrice?.toString() ?? "";
  saleForm.salesDate = item.salesDate ?? "";
  saleForm.arrivedFlag = item.arrivedFlag;
  saleForm.soldFlag = item.soldFlag;
}

function closeSaleForm(): void {
  saleFormItemId.value = null;
}

async function saveSale(id: number): Promise<void> {
  error.value = null;
  try {
    const patch: StockItemSaleUpdate = {
      salesChannelId: saleForm.salesChannelId ? Number(saleForm.salesChannelId) : undefined,
      salesPrice: saleForm.salesPrice ? Number(saleForm.salesPrice) : undefined,
      salesDate: saleForm.salesDate || undefined,
      arrivedFlag: saleForm.arrivedFlag,
      soldFlag: saleForm.soldFlag,
    };
    await api.patch(`/api/stock-items/${id}/sale`, patch);
    closeSaleForm();
    await loadStockItems();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function productName(id: number): string {
  return products.value.find((p) => p.id === id)?.name ?? `#${id}`;
}

function shopName(id: number): string {
  return shops.value.find((s) => s.id === id)?.name ?? `#${id}`;
}

function salesChannelName(id: number | null): string {
  if (id === null) return "-";
  const channel = salesChannels.value.find((c) => c.id === id);
  return channel ? channel.shopName : `#${id}`;
}

onMounted(async () => {
  await Promise.all([loadMasters(), loadStockItems()]);
});
</script>

<template>
  <section>
    <h1 class="page-title">購入商品登録</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>

    <form class="card stock-form" @submit.prevent="submit">
      <div class="row">
        <select v-model="form.productId" required>
          <option value="" disabled>商品</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="form.accountKey" required>
          <option value="" disabled>アカウント</option>
          <option v-for="a in accounts" :key="a.key" :value="a.key">{{ a.label }}</option>
        </select>
        <select v-model="form.purchaseTypeKey" required>
          <option value="" disabled>仕入れ区分</option>
          <option v-for="t in purchaseTypes" :key="t.key" :value="t.key">{{ t.label }}</option>
        </select>
        <select v-if="isEc" v-model="form.purchaseSiteKey">
          <option value="" disabled>①モール/カテゴリ</option>
          <option v-for="s in purchaseSites" :key="s.key" :value="s.key">{{ s.label }}</option>
        </select>
        <select v-model="form.shopId" required>
          <option value="" disabled>②仕入れ先</option>
          <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="row">
        <input v-model="form.purchasePrice" type="number" placeholder="仕入れ価格" required />
        <label>仕入れ日 <input v-model="form.purchaseDate" type="date" required /></label>
        <input v-model="form.groupId" type="text" placeholder="グループID（任意）" />
        <input v-model="form.memo" type="text" placeholder="備考" />
      </div>

      <fieldset>
        <legend>支払い内訳</legend>
        <div v-for="(detail, index) in form.paymentDetails" :key="index" class="row">
          <select v-model="detail.paymentMethodId">
            <option value="0" disabled>支払い方法</option>
            <option v-for="m in paymentMethods" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <input v-model="detail.amount" type="number" placeholder="金額" />
          <select v-model="detail.creditCardId">
            <option value="">クレジットカード（該当時）</option>
            <option v-for="c in creditCards" :key="c.id" :value="c.id">{{ c.displayName }}</option>
          </select>
          <select v-model="detail.pointTypeId">
            <option value="">ポイント種別（該当時）</option>
            <option v-for="p in pointTypes" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <button type="button" class="btn btn-sm btn-danger" @click="removePaymentDetail(index)">削除</button>
        </div>
        <button type="button" class="btn btn-sm" @click="addPaymentDetail">支払い内訳を追加</button>
      </fieldset>

      <fieldset>
        <legend>ポイント内訳</legend>
        <div v-for="(detail, index) in form.pointDetails" :key="index" class="row">
          <select v-model="detail.pointTypeId">
            <option value="0" disabled>ポイント種別</option>
            <option v-for="p in pointTypes" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <input v-model="detail.amount" type="number" placeholder="獲得ポイント" />
          <button type="button" class="btn btn-sm btn-danger" @click="removePointDetail(index)">削除</button>
        </div>
        <button type="button" class="btn btn-sm" @click="addPointDetail">ポイント内訳を追加</button>
      </fieldset>

      <button type="submit" class="btn btn-primary">登録</button>
    </form>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>商品</th>
            <th>仕入先</th>
            <th>販売先</th>
            <th>仕入価格</th>
            <th>実質価格</th>
            <th>売上価格</th>
            <th>利益</th>
            <th>利益率</th>
            <th>ステータス</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in stockItems" :key="item.id">
            <tr>
              <td>{{ productName(item.productId) }}</td>
              <td>{{ shopName(item.shopId) }}</td>
              <td>{{ salesChannelName(item.salesChannelId) }}</td>
              <td>{{ item.purchasePrice.toLocaleString() }}</td>
              <td>{{ item.netPurchasePrice.toLocaleString() }}</td>
              <td>{{ item.salesPrice?.toLocaleString() ?? "-" }}</td>
              <td :class="{ 'profit-positive': (item.profit ?? 0) > 0, 'profit-negative': (item.profit ?? 0) < 0 }">
                {{ item.profit?.toLocaleString() ?? "-" }}
              </td>
              <td>{{ item.profitRate !== null ? `${item.profitRate.toFixed(1)}%` : "-" }}</td>
              <td><span class="status-badge" :class="`status-${item.status}`">{{ item.status }}</span></td>
              <td class="actions">
                <button type="button" class="btn btn-sm" @click="openSaleForm(item)">到着/売却記録</button>
                <button type="button" class="btn btn-sm btn-danger" @click="remove(item.id)">削除</button>
              </td>
            </tr>
            <tr v-if="saleFormItemId === item.id" class="sale-form-row">
              <td colspan="10">
                <div class="row">
                  <select v-model="saleForm.salesChannelId">
                    <option value="">販売先</option>
                    <option v-for="c in salesChannels" :key="c.id" :value="c.id">{{ c.shopName }}</option>
                  </select>
                  <input v-model="saleForm.salesPrice" type="number" placeholder="売上価格" />
                  <label>売却日 <input v-model="saleForm.salesDate" type="date" /></label>
                  <label><input v-model="saleForm.arrivedFlag" type="checkbox" /> 到着済み</label>
                  <label><input v-model="saleForm.soldFlag" type="checkbox" /> 売却済み</label>
                  <button type="button" class="btn btn-sm btn-primary" @click="saveSale(item.id)">保存</button>
                  <button type="button" class="btn btn-sm" @click="closeSaleForm">キャンセル</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.stock-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.5rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.row label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

fieldset {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
}

legend {
  padding: 0 0.4rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.stock-form > .btn-primary {
  align-self: flex-start;
}

.sale-form-row td {
  background: var(--color-surface-alt);
  white-space: normal;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.status-badge.status-売却済み {
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
}

.status-badge.status-保有中 {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}
</style>
