<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { api } from "../api/client";
import type { Product } from "../types";

const items = ref<Product[]>([]);
const error = ref<string | null>(null);

const newItem = reactive({ name: "", shortName: "", janCode: "", category: "" });

const editingId = ref<number | null>(null);
const editingItem = reactive({ name: "", shortName: "", janCode: "", category: "" });

async function load(): Promise<void> {
  items.value = await api.get<Product[]>("/api/products");
}

async function add(): Promise<void> {
  if (!newItem.name.trim()) return;
  error.value = null;
  try {
    await api.post("/api/products", {
      name: newItem.name.trim(),
      shortName: newItem.shortName || undefined,
      janCode: newItem.janCode || undefined,
      category: newItem.category || undefined,
    });
    newItem.name = "";
    newItem.shortName = "";
    newItem.janCode = "";
    newItem.category = "";
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function startEdit(item: Product): void {
  editingId.value = item.id;
  editingItem.name = item.name;
  editingItem.shortName = item.shortName ?? "";
  editingItem.janCode = item.janCode ?? "";
  editingItem.category = item.category ?? "";
}

function cancelEdit(): void {
  editingId.value = null;
}

async function saveEdit(id: number): Promise<void> {
  error.value = null;
  try {
    await api.patch(`/api/products/${id}`, {
      name: editingItem.name,
      shortName: editingItem.shortName,
      janCode: editingItem.janCode,
      category: editingItem.category,
    });
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
    await api.delete(`/api/products/${id}`);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(load);
</script>

<template>
  <section>
    <h1>商品マスタ</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <form class="add-form" @submit.prevent="add">
      <input v-model="newItem.name" type="text" placeholder="正式商品名（必須）" required />
      <input v-model="newItem.shortName" type="text" placeholder="省略表示名" />
      <input v-model="newItem.janCode" type="text" placeholder="JANコード" />
      <input v-model="newItem.category" type="text" placeholder="商品カテゴリ" />
      <button type="submit">追加</button>
    </form>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>正式商品名</th>
            <th>省略表示名</th>
            <th>JAN</th>
            <th>カテゴリ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <template v-if="editingId === item.id">
              <td><input v-model="editingItem.name" type="text" /></td>
              <td><input v-model="editingItem.shortName" type="text" /></td>
              <td><input v-model="editingItem.janCode" type="text" /></td>
              <td><input v-model="editingItem.category" type="text" /></td>
              <td class="actions">
                <button type="button" @click="saveEdit(item.id)">保存</button>
                <button type="button" @click="cancelEdit">キャンセル</button>
              </td>
            </template>
            <template v-else>
              <td>{{ item.name }}</td>
              <td>{{ item.shortName }}</td>
              <td>{{ item.janCode }}</td>
              <td>{{ item.category }}</td>
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
