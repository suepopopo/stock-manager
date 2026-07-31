<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api } from "../api/client";
import type { ConfigEntry, CreditCard, CreditCardBilling } from "../types";

const cards = ref<CreditCard[]>([]);
const billings = ref<CreditCardBilling[]>([]);
const accounts = ref<ConfigEntry[]>([]);
const error = ref<string | null>(null);
const year = ref(new Date().getFullYear());

const months = Array.from({ length: 12 }, (_, i) => i + 1);

function yearMonthOf(month: number): string {
  return `${year.value}-${String(month).padStart(2, "0")}-01`;
}

const cardsByAccount = computed(() => {
  const groups = new Map<string, CreditCard[]>();
  for (const card of cards.value) {
    const list = groups.get(card.accountKey) ?? [];
    list.push(card);
    groups.set(card.accountKey, list);
  }
  return groups;
});

function accountLabel(accountKey: string): string {
  return accounts.value.find((a) => a.key === accountKey)?.label ?? accountKey;
}

function billedAmount(creditCardId: number, month: number): number | null {
  const ym = yearMonthOf(month);
  return billings.value.find((b) => b.creditCardId === creditCardId && b.billingYearMonth === ym)
    ?.billedAmount ?? null;
}

function accountSubtotal(accountKey: string, month: number): number {
  const cardIds = (cardsByAccount.value.get(accountKey) ?? []).map((c) => c.id);
  return billings.value
    .filter((b) => cardIds.includes(b.creditCardId) && b.billingYearMonth === yearMonthOf(month))
    .reduce((sum, b) => sum + b.billedAmount, 0);
}

async function load(): Promise<void> {
  const [cardList, billingList, accountList] = await Promise.all([
    api.get<CreditCard[]>("/api/credit-cards"),
    api.get<CreditCardBilling[]>("/api/credit-card-billings"),
    api.get<ConfigEntry[]>("/api/config/accounts"),
  ]);
  cards.value = cardList;
  billings.value = billingList;
  accounts.value = accountList;
}

async function updateBilling(creditCardId: number, month: number, value: string): Promise<void> {
  error.value = null;
  const billedAmount = value === "" ? 0 : Number(value);
  try {
    await api.put("/api/credit-card-billings", {
      creditCardId,
      billingYearMonth: yearMonthOf(month),
      billedAmount,
    });
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(load);
</script>

<template>
  <section>
    <h1>クレジットカード支払い管理</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <label class="year-picker">
      対象年
      <input v-model.number="year" type="number" />
    </label>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>カード</th>
            <th v-for="m in months" :key="m">{{ m }}月</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="[accountKey, accountCards] in cardsByAccount" :key="accountKey">
            <tr v-for="card in accountCards" :key="card.id">
              <td>{{ accountLabel(accountKey) }} / {{ card.displayName }}</td>
              <td v-for="m in months" :key="m">
                <input
                  type="number"
                  :value="billedAmount(card.id, m) ?? ''"
                  @change="updateBilling(card.id, m, ($event.target as HTMLInputElement).value)"
                />
              </td>
            </tr>
            <tr class="subtotal-row">
              <td>{{ accountLabel(accountKey) }} 小計</td>
              <td v-for="m in months" :key="m">{{ accountSubtotal(accountKey, m).toLocaleString() }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.year-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.year-picker input {
  width: 6rem;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.4rem;
  border-bottom: 1px solid var(--border-color, #ddd);
  white-space: nowrap;
}

td input {
  width: 5rem;
}

.subtotal-row {
  font-weight: bold;
  background: color-mix(in srgb, currentColor 6%, transparent);
}

.error {
  color: #c0392b;
}
</style>
