<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { api } from "../api/client";
import type { ConfigEntry, CreditCard } from "../types";

const items = ref<CreditCard[]>([]);
const accounts = ref<ConfigEntry[]>([]);
const brands = ref<ConfigEntry[]>([]);
const error = ref<string | null>(null);

type FormState = {
  accountKey: string;
  brandKey: string;
  cardName: string;
  cardLast4: string;
  displayName: string;
  holderName: string;
  status: "契約中" | "解約済";
  joinedDate: string;
  canceledDate: string;
  annualFeeFlag: boolean;
  annualFeeAmount: string;
  annualFeePaymentDay: string;
  memo: string;
};

function emptyForm(): FormState {
  return {
    accountKey: "",
    brandKey: "",
    cardName: "",
    cardLast4: "",
    displayName: "",
    holderName: "",
    status: "契約中",
    joinedDate: "",
    canceledDate: "",
    annualFeeFlag: false,
    annualFeeAmount: "",
    annualFeePaymentDay: "",
    memo: "",
  };
}

const newItem = reactive(emptyForm());
const editingId = ref<number | null>(null);
const editingItem = reactive(emptyForm());

function toPayload(form: FormState) {
  return {
    accountKey: form.accountKey,
    brandKey: form.brandKey,
    cardName: form.cardName,
    cardLast4: form.cardLast4 || undefined,
    displayName: form.displayName,
    holderName: form.holderName,
    status: form.status,
    joinedDate: form.joinedDate,
    canceledDate: form.canceledDate || undefined,
    annualFeeFlag: form.annualFeeFlag,
    annualFeeAmount: form.annualFeeAmount ? Number(form.annualFeeAmount) : undefined,
    annualFeePaymentDay: form.annualFeePaymentDay ? Number(form.annualFeePaymentDay) : undefined,
    memo: form.memo || undefined,
  };
}

async function load(): Promise<void> {
  items.value = await api.get<CreditCard[]>("/api/credit-cards");
}

async function loadConfig(): Promise<void> {
  accounts.value = await api.get<ConfigEntry[]>("/api/config/accounts");
  brands.value = await api.get<ConfigEntry[]>("/api/config/credit-card-brands");
}

async function add(): Promise<void> {
  error.value = null;
  try {
    await api.post("/api/credit-cards", toPayload(newItem));
    Object.assign(newItem, emptyForm());
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function startEdit(item: CreditCard): void {
  editingId.value = item.id;
  editingItem.accountKey = item.accountKey;
  editingItem.brandKey = item.brandKey;
  editingItem.cardName = item.cardName;
  editingItem.cardLast4 = item.cardLast4 ?? "";
  editingItem.displayName = item.displayName;
  editingItem.holderName = item.holderName;
  editingItem.status = item.status;
  editingItem.joinedDate = item.joinedDate;
  editingItem.canceledDate = item.canceledDate ?? "";
  editingItem.annualFeeFlag = item.annualFeeFlag;
  editingItem.annualFeeAmount = item.annualFeeAmount?.toString() ?? "";
  editingItem.annualFeePaymentDay = item.annualFeePaymentDay?.toString() ?? "";
  editingItem.memo = item.memo ?? "";
}

function cancelEdit(): void {
  editingId.value = null;
}

async function saveEdit(id: number): Promise<void> {
  error.value = null;
  try {
    await api.patch(`/api/credit-cards/${id}`, toPayload(editingItem));
    editingId.value = null;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function remove(id: number): Promise<void> {
  if (!confirm("削除しますか？")) return;
  error.value = null;
  try {
    await api.delete(`/api/credit-cards/${id}`);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function labelOf(entries: ConfigEntry[], key: string): string {
  return entries.find((e) => e.key === key)?.label ?? key;
}

onMounted(async () => {
  await Promise.all([load(), loadConfig()]);
});
</script>

<template>
  <section>
    <h1 class="page-title">クレジットカードマスタ</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>

    <form class="card form-grid" @submit.prevent="add">
      <select v-model="newItem.accountKey" required>
        <option value="" disabled>アカウント</option>
        <option v-for="a in accounts" :key="a.key" :value="a.key">{{ a.label }}</option>
      </select>
      <select v-model="newItem.brandKey" required>
        <option value="" disabled>ブランド</option>
        <option v-for="b in brands" :key="b.key" :value="b.key">{{ b.label }}</option>
      </select>
      <input v-model="newItem.cardName" type="text" placeholder="カード名" required />
      <input v-model="newItem.displayName" type="text" placeholder="表示名" required />
      <input v-model="newItem.holderName" type="text" placeholder="名義" required />
      <input v-model="newItem.cardLast4" type="text" placeholder="下4桁" maxlength="4" />
      <select v-model="newItem.status">
        <option value="契約中">契約中</option>
        <option value="解約済">解約済</option>
      </select>
      <label>入会日 <input v-model="newItem.joinedDate" type="date" required /></label>
      <label>解約日 <input v-model="newItem.canceledDate" type="date" /></label>
      <label><input v-model="newItem.annualFeeFlag" type="checkbox" /> 年会費有無</label>
      <input v-model="newItem.annualFeeAmount" type="number" placeholder="年会費金額" />
      <input v-model="newItem.annualFeePaymentDay" type="number" placeholder="年会費支払日(1-31)" min="1" max="31" />
      <input v-model="newItem.memo" type="text" placeholder="備考" />
      <button type="submit" class="btn btn-primary">追加</button>
    </form>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>表示名</th>
            <th>アカウント</th>
            <th>ブランド</th>
            <th>名義</th>
            <th>下4桁</th>
            <th>ステータス</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <template v-if="editingId === item.id">
              <td><input v-model="editingItem.displayName" type="text" /></td>
              <td>
                <select v-model="editingItem.accountKey">
                  <option v-for="a in accounts" :key="a.key" :value="a.key">{{ a.label }}</option>
                </select>
              </td>
              <td>
                <select v-model="editingItem.brandKey">
                  <option v-for="b in brands" :key="b.key" :value="b.key">{{ b.label }}</option>
                </select>
              </td>
              <td><input v-model="editingItem.holderName" type="text" /></td>
              <td><input v-model="editingItem.cardLast4" type="text" maxlength="4" /></td>
              <td>
                <select v-model="editingItem.status">
                  <option value="契約中">契約中</option>
                  <option value="解約済">解約済</option>
                </select>
              </td>
              <td class="actions">
                <button type="button" class="btn btn-sm btn-primary" @click="saveEdit(item.id)">保存</button>
                <button type="button" class="btn btn-sm" @click="cancelEdit">キャンセル</button>
              </td>
            </template>
            <template v-else>
              <td>{{ item.displayName }}</td>
              <td>{{ labelOf(accounts, item.accountKey) }}</td>
              <td>{{ labelOf(brands, item.brandKey) }}</td>
              <td>{{ item.holderName }}</td>
              <td>{{ item.cardLast4 }}</td>
              <td>{{ item.status }}</td>
              <td class="actions">
                <button type="button" class="btn btn-sm" @click="startEdit(item)">編集</button>
                <button type="button" class="btn btn-sm btn-danger" @click="remove(item.id)">削除</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
form.card {
  margin-bottom: 1.25rem;
}

form.card label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
