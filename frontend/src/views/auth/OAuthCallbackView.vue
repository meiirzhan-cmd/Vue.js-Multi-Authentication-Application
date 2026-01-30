<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AuthLayout } from "@/components/layout";
import { LoadingSpinner, AppAlert, AppButton } from "@/components/ui";
import { CheckCircle, AlertCircle } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

type Status = "processing" | "success" | "error";
const status = ref<Status>("processing");
const errorMessage = ref("");

onMounted(() => {
  // Get tokens from URL query params (passed by backend after OAuth)
  const error = route.query.error as string;

  if (error) {
    status.value = "error";
    errorMessage.value = decodeURIComponent(error);
    return;
  }

  // Create URLSearchParams from route query for the auth store
  const params = new URLSearchParams();
  if (route.query.accessToken) {
    params.set("accessToken", route.query.accessToken as string);
  }
  if (route.query.refreshToken) {
    params.set("refreshToken", route.query.refreshToken as string);
  }

  if (!params.get("accessToken") || !params.get("refreshToken")) {
    status.value = "error";
    errorMessage.value = "Invalid callback. Missing authentication tokens.";
    return;
  }

  try {
    // Use the store method to handle OAuth callback
    const success = authStore.handleOAuthCallback(params);

    if (success) {
      status.value = "success";
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      status.value = "error";
      errorMessage.value = authStore.error || "Authentication failed";
    }
  } catch (err: any) {
    status.value = "error";
    errorMessage.value = err.message || "An unexpected error occurred";
  }
});
</script>

<template>
  <AuthLayout>
    <div class="text-center py-12">
      <!-- Processing -->
      <template v-if="status === 'processing'">
        <LoadingSpinner size="xl" />
        <h2 class="mt-6 text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
        <p class="mt-2 text-gray-600">
          Please wait while we finish authenticating your account.
        </p>
      </template>

      <!-- Success -->
      <template v-else-if="status === 'success'">
        <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle class="w-10 h-10 text-green-600" />
        </div>
        <h2 class="mt-6 text-xl font-semibold text-gray-900">
          Successfully signed in!
        </h2>
        <p class="mt-2 text-gray-600">
          Redirecting you to the dashboard...
        </p>
      </template>

      <!-- Error -->
      <template v-else-if="status === 'error'">
        <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle class="w-10 h-10 text-red-600" />
        </div>
        <h2 class="mt-6 text-xl font-semibold text-gray-900">
          Authentication failed
        </h2>
        <AppAlert variant="error" class="mt-4">
          {{ errorMessage }}
        </AppAlert>
        <div class="mt-6 space-y-3">
          <router-link to="/login">
            <AppButton full-width>
              Back to Login
            </AppButton>
          </router-link>
          <router-link to="/">
            <AppButton variant="ghost" full-width>
              Go to Home
            </AppButton>
          </router-link>
        </div>
      </template>
    </div>
  </AuthLayout>
</template>
