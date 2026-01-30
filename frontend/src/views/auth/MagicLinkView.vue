<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, Loader2, ArrowLeft } from "lucide-vue-next";

const authStore = useAuthStore();

const email = ref("");
const magicLinkSent = ref(false);

const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

async function handleSubmit() {
  if (!email.value) return;

  const success = await authStore.sendMagicLink(email.value);

  if (success) {
    magicLinkSent.value = true;
  }
}

function resetForm() {
  magicLinkSent.value = false;
  email.value = "";
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <Mail class="w-12 h-12 mx-auto text-indigo-600" />
        <h2 class="mt-4 text-3xl font-bold text-gray-900">
          Sign in with Magic Link
        </h2>
        <p class="mt-2 text-gray-600">
          No password needed. We'll send you a secure link to sign in.
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
      >
        {{ error }}
      </div>

      <!-- Email Form -->
      <form
        v-if="!magicLinkSent"
        @submit.prevent="handleSubmit"
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
            placeholder="you@example.com"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
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

      <!-- Success Message -->
      <div v-else class="text-center py-8 space-y-4">
        <div
          class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center"
        >
          <Mail class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900">Check your email</h3>
        <p class="text-gray-600">
          We've sent a magic link to <strong>{{ email }}</strong>
        </p>
        <p class="text-sm text-gray-500">
          The link will expire in 15 minutes. Check your spam folder if you
          don't see it.
        </p>
        <button
          @click="resetForm"
          class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft class="w-4 h-4" />
          Send to a different email
        </button>
      </div>

      <!-- Back to Login -->
      <div class="text-center">
        <router-link
          to="/login"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to login
        </router-link>
      </div>
    </div>
  </div>
</template>
