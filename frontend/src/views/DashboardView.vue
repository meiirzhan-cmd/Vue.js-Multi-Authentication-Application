<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { AppLayout } from "@/components/layout";
import { AppCard } from "@/components/ui";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  Key,
  Fingerprint,
  Clock,
} from "lucide-vue-next";
import GoogleIcon from "@/components/icons/GoogleIcon.vue";

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const userInitials = computed(() => {
  if (!user.value?.name) return user.value?.email?.charAt(0).toUpperCase() || "U";
  return user.value.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const providerInfo = computed(() => {
  const providers = {
    LOCAL: { label: "Email & Password", icon: Key, color: "text-blue-600 bg-blue-100" },
    GOOGLE: { label: "Google", icon: GoogleIcon, color: "text-red-600 bg-red-100" },
    MAGIC_LINK: { label: "Magic Link", icon: Mail, color: "text-purple-600 bg-purple-100" },
  };
  return providers[user.value?.provider || "LOCAL"];
});

const memberSince = computed(() => {
  if (!user.value?.createdAt) return "";
  return new Date(user.value.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const stats = computed(() => [
  {
    label: "Account Status",
    value: "Active",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    label: "Auth Method",
    value: providerInfo.value.label,
    icon: providerInfo.value.icon,
    color: "text-indigo-600",
  },
  {
    label: "Email Verified",
    value: user.value?.emailVerified ? "Yes" : "No",
    icon: user.value?.emailVerified ? CheckCircle : AlertCircle,
    color: user.value?.emailVerified ? "text-green-600" : "text-yellow-600",
  },
]);
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {{ user?.name || "User" }}
        </h1>
        <p class="mt-1 text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <AppCard>
            <div class="text-center">
              <!-- Avatar -->
              <div class="mb-4">
                <div
                  v-if="user?.avatar"
                  class="w-24 h-24 mx-auto rounded-full bg-cover bg-center ring-4 ring-indigo-50"
                  :style="{ backgroundImage: `url(${user.avatar})` }"
                />
                <div
                  v-else
                  class="w-24 h-24 mx-auto rounded-full bg-indigo-100 flex items-center justify-center ring-4 ring-indigo-50"
                >
                  <span class="text-2xl font-semibold text-indigo-600">
                    {{ userInitials }}
                  </span>
                </div>
              </div>

              <!-- Name & Email -->
              <h2 class="text-xl font-semibold text-gray-900">
                {{ user?.name || "User" }}
              </h2>
              <p class="text-gray-500">{{ user?.email }}</p>

              <!-- Provider Badge -->
              <div class="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                :class="providerInfo.color"
              >
                <component :is="providerInfo.icon" class="w-4 h-4" />
                {{ providerInfo.label }}
              </div>

              <!-- Member Since -->
              <div class="mt-6 pt-6 border-t border-gray-100">
                <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Calendar class="w-4 h-4" />
                  Member since {{ memberSince }}
                </div>
              </div>

              <!-- Edit Profile Link -->
              <router-link
                to="/profile"
                class="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                <User class="w-4 h-4" />
                Edit Profile
              </router-link>
            </div>
          </AppCard>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Stats Grid -->
          <div class="grid sm:grid-cols-3 gap-4">
            <AppCard v-for="stat in stats" :key="stat.label" padding="sm">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-gray-100">
                  <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">{{ stat.label }}</p>
                  <p class="font-semibold text-gray-900">{{ stat.value }}</p>
                </div>
              </div>
            </AppCard>
          </div>

          <!-- Quick Actions -->
          <AppCard>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid sm:grid-cols-2 gap-4">
              <router-link
                to="/profile"
                class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
              >
                <div class="p-3 rounded-lg bg-indigo-100">
                  <User class="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Edit Profile</p>
                  <p class="text-sm text-gray-500">Update your personal information</p>
                </div>
              </router-link>

              <router-link
                to="/profile"
                class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
              >
                <div class="p-3 rounded-lg bg-green-100">
                  <Shield class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Security Settings</p>
                  <p class="text-sm text-gray-500">Change password and security</p>
                </div>
              </router-link>
            </div>
          </AppCard>

          <!-- Activity (placeholder) -->
          <AppCard>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-green-100">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">Successfully logged in</p>
                  <p class="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-blue-100">
                  <Fingerprint class="w-4 h-4 text-blue-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">Account authenticated via {{ providerInfo.label }}</p>
                  <p class="text-xs text-gray-500">Current session</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-gray-100">
                  <Clock class="w-4 h-4 text-gray-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">Account created</p>
                  <p class="text-xs text-gray-500">{{ memberSince }}</p>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
