<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client";
import type { SimpleMaster } from "../types";

const props = defineProps<{
  basePath: string;
  title: string;
}>();

const items = ref<SimpleMaster[]>([]);
const newName = ref("");
const editingId = ref<number | null>(null);
const editingName = ref("");
const error = ref<string | null>(null);

async function load(): Promise<void> {
  items.value = await api.get<SimpleMaster[]>(props.basePath);
}

async function add(): Promise<void> {
  if (!newName.value.trim()) return;
  error.value = null;
  try {
    await api.post(props.basePath, { name: newName.value.trim() });
    newName.value = "";
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function startEdit(item: SimpleMaster): void {
  editingId.value = item.id;
  editingName.value = item.name;
}

function cancelEdit(): void {
  editingId.value = null;
}

async function saveEdit(id: number): Promise<void> {
  if (!editingName.value.trim()) return;
  error.value = null;
  try {
    await api.patch(`${props.basePath}/${id}`, { name: editingName.value.trim() });
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
    await api.delete(`${props.basePath}/${id}`);
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(load);
</script>

<template>
  <section>
    <h1>{{ title }}</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <form class="add-form" @submit.prevent="add">
      <input v-model="newName" type="text" placeholder="新規登録" />
      <button type="submit">追加</button>
    </form>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>名前</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>
              <input v-if="editingId === item.id" v-model="editingName" type="text" />
              <span v-else>{{ item.name }}</span>
            </td>
            <td class="actions">
              <template v-if="editingId === item.id">
                <button type="button" @click="saveEdit(item.id)">保存</button>
                <button type="button" @click="cancelEdit">キャンセル</button>
              </template>
              <template v-else>
                <button type="button" @click="startEdit(item)">編集</button>
                <button type="button" @click="remove(item.id)">削除</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.add-form {
  display: flex;
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
