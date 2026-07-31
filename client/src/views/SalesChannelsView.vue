<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { api } from "../api/client";
import type { SalesChannel } from "../types";

const items = ref<SalesChannel[]>([]);
const error = ref<string | null>(null);

const newItem = reactive({ corporateNumber: "", companyName: "", shopName: "" });

const editingId = ref<number | null>(null);
const editingItem = reactive({ corporateNumber: "", companyName: "", shopName: "" });

async function load(): Promise<void> {
  items.value = await api.get<SalesChannel[]>("/api/sales-channels");
}

async function add(): Promise<void> {
  if (!newItem.companyName.trim() || !newItem.shopName.trim()) return;
  error.value = null;
  try {
    await api.post("/api/sales-channels", {
      corporateNumber: newItem.corporateNumber || undefined,
      companyName: newItem.companyName.trim(),
      shopName: newItem.shopName.trim(),
    });
    newItem.corporateNumber = "";
    newItem.companyName = "";
    newItem.shopName = "";
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function startEdit(item: SalesChannel): void {
  editingId.value = item.id;
  editingItem.corporateNumber = item.corporateNumber ?? "";
  editingItem.companyName = item.companyName;
  editingItem.shopName = item.shopName;
}

function cancelEdit(): void {
  editingId.value = null;
}

async function saveEdit(id: number): Promise<void> {
  error.value = null;
  try {
    await api.patch(`/api/sales-channels/${id}`, { ...editingItem });
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
    await api.delete(`/api/sales-channels/${id}`);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(load);
</script>

<template>
  <section>
    <h1>販売先マスタ</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <form class="add-form" @submit.prevent="add">
      <input v-model="newItem.corporateNumber" type="text" placeholder="法人番号（任意）" />
      <input v-model="newItem.companyName" type="text" placeholder="会社名（必須）" required />
      <input v-model="newItem.shopName" type="text" placeholder="店名（必須）" required />
      <button type="submit">追加</button>
    </form>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>法人番号</th>
            <th>会社名</th>
            <th>店名</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <template v-if="editingId === item.id">
              <td><input v-model="editingItem.corporateNumber" type="text" /></td>
              <td><input v-model="editingItem.companyName" type="text" /></td>
              <td><input v-model="editingItem.shopName" type="text" /></td>
              <td class="actions">
                <button type="button" @click="saveEdit(item.id)">保存</button>
                <button type="button" @click="cancelEdit">キャンセル</button>
              </td>
            </template>
            <template v-else>
              <td>{{ item.corporateNumber }}</td>
              <td>{{ item.companyName }}</td>
              <td>{{ item.shopName }}</td>
              <td class="actions">
                <button type="button" @click="startEdit(item)">編集</button>
                <button type="button" @click="remove(item.id)">削除</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
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
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.error {
  color: #c0392b;
}
</style>
