import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/stock-items" },
    {
      path: "/stock-items",
      name: "stock-items",
      component: () => import("../views/StockItemsView.vue"),
    },
    {
      path: "/monthly-summary",
      name: "monthly-summary",
      component: () => import("../views/MonthlySummaryView.vue"),
    },
    {
      path: "/products",
      name: "products",
      component: () => import("../views/ProductsView.vue"),
    },
    {
      path: "/shops",
      name: "shops",
      component: () => import("../views/SimpleMasterView.vue"),
      props: { basePath: "/api/shops", title: "仕入れ先マスタ" },
    },
    {
      path: "/sales-channels",
      name: "sales-channels",
      component: () => import("../views/SalesChannelsView.vue"),
    },
    {
      path: "/payment-methods",
      name: "payment-methods",
      component: () => import("../views/SimpleMasterView.vue"),
      props: { basePath: "/api/payment-methods", title: "支払い方法マスタ" },
    },
    {
      path: "/point-types",
      name: "point-types",
      component: () => import("../views/SimpleMasterView.vue"),
      props: { basePath: "/api/point-types", title: "ポイント種別マスタ" },
    },
    {
      path: "/credit-cards",
      name: "credit-cards",
      component: () => import("../views/CreditCardsView.vue"),
    },
    {
      path: "/credit-card-billings",
      name: "credit-card-billings",
      component: () => import("../views/CreditCardBillingsView.vue"),
    },
  ],
});

export default router;
