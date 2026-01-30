<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const isMobileMenuOpen = ref(false);
const isProfileMenuOpen = ref(false);

const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const userInitials = computed(() => {
  if (!user.value?.name) return user.value?.email?.charAt(0).toUpperCase() || "U";
  return user.value.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

async function handleLogout() {
  await authStore.logout();
  isProfileMenuOpen.value = false;
  router.push("/login");
}

function closeMenus() {
  isMobileMenuOpen.value = false;
  isProfileMenuOpen.value = false;
}
</script>

<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2" @click="closeMenus">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">MA</span>
            </div>
            <span class="font-semibold text-gray-900 hidden sm:block">MultiAuth</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-6">
          <template v-if="isAuthenticated">
            <router-link
              to="/dashboard"
              class="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </router-link>

            <!-- Profile Dropdown -->
            <div class="relative">
              <button
                @click="isProfileMenuOpen = !isProfileMenuOpen"
                class="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  v-if="user?.avatar"
                  class="w-8 h-8 rounded-full bg-cover bg-center"
                  :style="{ backgroundImage: `url(${user.avatar})` }"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"
                >
                  <span class="text-sm font-medium text-indigo-600">{{ userInitials }}</span>
                </div>
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isProfileMenuOpen"
                  class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ user?.name || "User" }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">{{ user?.email }}</p>
                  </div>
                  <router-link
                    to="/profile"
                    @click="isProfileMenuOpen = false"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User class="w-4 h-4" />
                    Profile
                  </router-link>
                  <router-link
                    to="/dashboard"
                    @click="isProfileMenuOpen = false"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard class="w-4 h-4" />
                    Dashboard
                  </router-link>
                  <hr class="my-1" />
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut class="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </Transition>
            </div>
          </template>

          <template v-else>
            <router-link
              to="/login"
              class="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get started
            </router-link>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <X v-if="isMobileMenuOpen" class="w-6 h-6" />
            <Menu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-gray-200">
        <div class="px-4 py-3 space-y-1">
          <template v-if="isAuthenticated">
            <div class="flex items-center gap-3 px-3 py-3 border-b border-gray-100 mb-2">
              <div
                v-if="user?.avatar"
                class="w-10 h-10 rounded-full bg-cover bg-center"
                :style="{ backgroundImage: `url(${user.avatar})` }"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"
              >
                <span class="text-sm font-medium text-indigo-600">{{ userInitials }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ user?.name || "User" }}</p>
                <p class="text-sm text-gray-500">{{ user?.email }}</p>
              </div>
            </div>
            <router-link
              to="/dashboard"
              @click="closeMenus"
              class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </router-link>
            <router-link
              to="/profile"
              @click="closeMenus"
              class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Profile
            </router-link>
            <button
              @click="handleLogout"
              class="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </template>

          <template v-else>
            <router-link
              to="/login"
              @click="closeMenus"
              class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Sign in
            </router-link>
            <router-link
              to="/register"
              @click="closeMenus"
              class="block px-3 py-2 rounded-lg bg-indigo-600 text-white text-center hover:bg-indigo-700"
            >
              Get started
            </router-link>
          </template>
        </div>
      </div>
    </Transition>
  </nav>

  <!-- Overlay to close menus -->
  <div
    v-if="isProfileMenuOpen"
    class="fixed inset-0 z-40"
    @click="isProfileMenuOpen = false"
  />
</template>
