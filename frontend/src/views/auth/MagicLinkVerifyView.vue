<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const status = ref<"verifying" | "success" | "error">("verifying");
const errorMessage = ref("");

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    status.value = "error";
    errorMessage.value = "Invalid magic link";
    return;
  }

  const success = await authStore.verifyMagicLink(token);

  if (success) {
    status.value = "success";
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } else {
    status.value = "error";
    errorMessage.value = authStore.error || "Invalid or expired magic link";
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full text-center p-8">
      <!-- Verifying -->
      <div v-if="status === 'verifying'" class="space-y-4">
        <div
          class="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"
        ></div>
        <p class="text-gray-600">Verifying your magic link...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" class="space-y-4">
        <div class="text-6xl">✅</div>
        <h2 class="text-2xl font-bold text-gray-900">You're in!</h2>
        <p class="text-gray-600">Redirecting to dashboard...</p>
      </div>

      <!-- Error -->
      <div v-else class="space-y-4">
        <div class="text-6xl">❌</div>
        <h2 class="text-2xl font-bold text-gray-900">Verification Failed</h2>
        <p class="text-red-600">{{ errorMessage }}</p>
        <router-link
          to="/login"
          class="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>
