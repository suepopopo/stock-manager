<script setup lang="ts">
import { ref } from "vue";

const navGroups = [
  {
    label: "取引",
    items: [
      { to: "/stock-items", label: "購入商品登録", icon: "📦" },
      { to: "/monthly-summary", label: "月次収益確認", icon: "📊" },
    ],
  },
  {
    label: "マスタ管理",
    items: [
      { to: "/products", label: "商品マスタ", icon: "🏷️" },
      { to: "/shops", label: "仕入れ先マスタ", icon: "🛒" },
      { to: "/sales-channels", label: "販売先マスタ", icon: "🏪" },
      { to: "/payment-methods", label: "支払い方法マスタ", icon: "💳" },
      { to: "/point-types", label: "ポイント種別マスタ", icon: "🎁" },
      { to: "/credit-cards", label: "クレジットカードマスタ", icon: "💠" },
      { to: "/credit-card-billings", label: "クレジットカード支払い管理", icon: "🧾" },
    ],
  },
];

const sidebarOpen = ref(false);

function closeSidebar(): void {
  sidebarOpen.value = false;
}
</script>

<template>
  <div class="app-shell">
    <div v-if="sidebarOpen" class="backdrop" @click="closeSidebar"></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="brand">せどり管理アプリ</div>
      <nav>
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <div class="nav-group-label">{{ group.label }}</div>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            @click="closeSidebar"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
    </aside>

    <div class="content-area">
      <header class="topbar">
        <button type="button" class="menu-toggle" @click="sidebarOpen = !sidebarOpen">☰</button>
        <span class="topbar-title">せどり管理アプリ</span>
      </header>
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--color-sidebar-bg);
  color: var(--color-sidebar-text);
  padding: 1.25rem 0.75rem;
  position: fixed;
  inset: 0 auto 0 0;
  overflow-y: auto;
  z-index: 20;
  transition: transform 0.2s ease;
}

.brand {
  color: var(--color-sidebar-text-active);
  font-weight: 700;
  font-size: 1.05rem;
  padding: 0 0.5rem 1.25rem;
}

.nav-group {
  margin-bottom: 1rem;
}

.nav-group-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--color-sidebar-text) 70%, transparent);
  padding: 0.4rem 0.5rem;
}

.nav-link,
.nav-link:visited,
.nav-link:active {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  color: var(--color-sidebar-text);
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-link:hover {
  background: color-mix(in srgb, var(--color-sidebar-active-bg) 60%, transparent);
}

.nav-link.router-link-active,
.nav-link.router-link-active:visited {
  background: var(--color-sidebar-active-bg);
  border-left-color: var(--color-primary);
  color: var(--color-sidebar-text-active);
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
}

.content-area {
  flex: 1;
  margin-left: 240px;
  min-width: 0;
}

.topbar {
  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
}

.topbar-title {
  font-weight: 700;
}

.backdrop {
  display: none;
}

main {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: var(--shadow-md);
  }

  .content-area {
    margin-left: 0;
  }

  .topbar {
    display: flex;
  }

  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 15;
  }

  main {
    padding: 1rem;
  }
}
</style>
