<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { api } from "../api/client";
import type { MonthlySummary } from "../types";

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);
const summary = ref<MonthlySummary | null>(null);
const error = ref<string | null>(null);

const yearMonth = computed(() => `${year.value}-${String(month.value).padStart(2, "0")}`);

async function load(): Promise<void> {
  error.value = null;
  try {
    summary.value = await api.get<MonthlySummary>(`/api/monthly-summary?yearMonth=${yearMonth.value}`);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function prevMonth(): void {
  if (month.value === 1) {
    month.value = 12;
    year.value -= 1;
  } else {
    month.value -= 1;
  }
}

function nextMonth(): void {
  if (month.value === 12) {
    month.value = 1;
    year.value += 1;
  } else {
    month.value += 1;
  }
}

watch(yearMonth, load);
onMounted(load);
</script>

<template>
  <section>
    <h1>月次収益確認</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="nav">
      <button type="button" @click="prevMonth">← 前月</button>
      <span class="current">{{ yearMonth }}</span>
      <button type="button" @click="nextMonth">翌月 →</button>
    </div>

    <table v-if="summary">
      <tbody>
        <tr>
          <th>仕入れ合計額（仕入れ日基準）</th>
          <td>{{ summary.purchaseTotal.toLocaleString() }} 円</td>
        </tr>
        <tr>
          <th>売上合計額（販売日基準）</th>
          <td>{{ summary.salesTotal.toLocaleString() }} 円</td>
        </tr>
        <tr>
          <th>利益合計額（販売日基準）</th>
          <td>{{ summary.profitTotal.toLocaleString() }} 円</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.current {
  font-weight: bold;
  font-size: 1.1rem;
}

table {
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.error {
  color: #c0392b;
}
</style>
