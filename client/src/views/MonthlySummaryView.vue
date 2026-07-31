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
    <h1 class="page-title">月次収益確認</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>

    <div class="nav">
      <button type="button" class="btn" @click="prevMonth">← 前月</button>
      <span class="current">{{ yearMonth }}</span>
      <button type="button" class="btn" @click="nextMonth">翌月 →</button>
    </div>

    <div v-if="summary" class="stat-grid">
      <div class="card stat-card">
        <div class="stat-label">仕入れ合計額<span class="text-muted">（仕入れ日基準）</span></div>
        <div class="stat-value">{{ summary.purchaseTotal.toLocaleString() }} 円</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">売上合計額<span class="text-muted">（販売日基準）</span></div>
        <div class="stat-value">{{ summary.salesTotal.toLocaleString() }} 円</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">利益合計額<span class="text-muted">（販売日基準）</span></div>
        <div
          class="stat-value"
          :class="{ 'profit-positive': summary.profitTotal > 0, 'profit-negative': summary.profitTotal < 0 }"
        >
          {{ summary.profitTotal.toLocaleString() }} 円
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.current {
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 5.5rem;
  text-align: center;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
}
</style>
