<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Eye, EyeOff, Mail, Loader2 } from "lucide-vue-next";
import GoogleIcon from "@/components/icons/GoogleIcon.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form state
const activeTab = ref<"password" | "magic">("password");
const email = ref("");
const password = ref("");
const magicLinkSent = ref(false);
const showPassword = ref(false);

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);
const redirectPath = computed(
  () => (route.query.redirect as string) || "/dashboard",
);

// Email/Password login
async function handlePasswordLogin() {
  if (!email.value || !password.value) return;

  const success = await authStore.login(email.value, password.value);

  if (success) {
    router.push(redirectPath.value);
  }
}

// Magic link login
async function handleMagicLink() {
  if (!email.value) return;

  const success = await authStore.sendMagicLink(email.value);

  if (success) {
    magicLinkSent.value = true;
  }
}

// Google OAuth
function handleGoogleLogin() {
  authStore.loginWithGoogle();
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-gray-600">
          Or
          <router-link
            to="/register"
            class="text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </router-link>
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'password'"
          :class="[
            'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'password'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Password
        </button>
        <button
          @click="
            activeTab = 'magic';
            magicLinkSent = false;
          "
          :class="[
            'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'magic'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Magic Link
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
      >
        {{ error }}
      </div>

      <!-- Password Login Form -->
      <form
        v-if="activeTab === 'password'"
        @submit.prevent="handlePasswordLogin"
        class="space-y-6"
      >
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div class="relative mt-1">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <EyeOff v-if="showPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Magic Link Form -->
      <form
        v-else-if="activeTab === 'magic' && !magicLinkSent"
        @submit.prevent="handleMagicLink"
        class="space-y-6"
      >
        <div>
          <label
            for="magic-email"
            class="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="magic-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <span v-if="isLoading">Sending...</span>
          <span v-else>Send Magic Link</span>
        </button>
      </form>

      <!-- Magic Link Sent Confirmation -->
      <div v-else-if="magicLinkSent" class="text-center py-8">
        <Mail class="w-16 h-16 mx-auto mb-4 text-indigo-600" />
        <h3 class="text-lg font-medium text-gray-900">Check your email</h3>
        <p class="mt-2 text-gray-600">
          We've sent a magic link to <strong>{{ email }}</strong>
        </p>
        <p class="mt-1 text-sm text-gray-500">
          The link will expire in 15 minutes.
        </p>
        <button
          @click="magicLinkSent = false"
          class="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Send another link
        </button>
      </div>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-gray-50 text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- Social Login -->
      <button
        @click="handleGoogleLogin"
        class="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </div>
  </div>
</template>
