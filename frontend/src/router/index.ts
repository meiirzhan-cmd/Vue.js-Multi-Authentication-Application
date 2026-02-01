import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/auth/RegisterView.vue"),
    meta: { guest: true },
  },
  {
    path: "/auth/magic-link",
    name: "MagicLink",
    component: () => import("@/views/auth/MagicLinkView.vue"),
    meta: { guest: true },
  },
  {
    path: "/auth/magic-link/verify",
    name: "MagicLinkVerify",
    component: () => import("@/views/auth/MagicLinkVerifyView.vue"),
  },
  {
    path: "/auth/callback",
    name: "OAuthCallback",
    component: () => import("@/views/auth/OAuthCallbackView.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Try to fetch user if we have tokens but no user
  if ((authStore.accessToken || authStore.refreshToken) && !authStore.user) {
    await authStore.fetchUser();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth;
  const isGuestOnly = to.meta.guest;

  if (requiresAuth && !isAuthenticated) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (isGuestOnly && isAuthenticated) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
