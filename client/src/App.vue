<script setup lang="ts">
const navItems = [
  { to: "/stock-items", label: "購入商品登録" },
  { to: "/monthly-summary", label: "月次収益確認" },
  { to: "/products", label: "商品マスタ" },
  { to: "/shops", label: "仕入れ先マスタ" },
  { to: "/sales-channels", label: "販売先マスタ" },
  { to: "/payment-methods", label: "支払い方法マスタ" },
  { to: "/point-types", label: "ポイント種別マスタ" },
  { to: "/credit-cards", label: "クレジットカードマスタ" },
  { to: "/credit-card-billings", label: "クレジットカード支払い管理" },
];
</script>

<template>
  <div class="app-shell">
    <header>
      <h1 class="app-title">せどり管理アプリ</h1>
      <nav>
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to">{{ item.label }}</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.app-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
}

nav a {
  padding: 0.25rem 0;
  white-space: nowrap;
  text-decoration: none;
}

nav a.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}

main {
  padding: 1rem;
  max-width: 1100px;
  margin: 0 auto;
}
</style>
