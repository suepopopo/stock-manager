<script setup lang="ts">
import { onMounted, ref } from "vue";

type Product = {
  id: number;
  name: string;
  shortName: string | null;
  janCode: string | null;
  category: string | null;
};

const products = ref<Product[]>([]);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) {
      throw new Error(`request failed: ${res.status}`);
    }
    products.value = await res.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
});
</script>

<template>
  <main>
    <h1>せどり管理アプリ</h1>
    <p v-if="error">読み込みエラー: {{ error }}</p>
    <ul v-else>
      <li v-for="product in products" :key="product.id">{{ product.name }}</li>
    </ul>
  </main>
</template>

<style scoped>
main {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
