<script setup lang="ts">
import { AppLayout } from "@/components/layout";
import { AppButton } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-vue-next";
</script>

<template>
  <AppLayout>
    <div class="min-h-[60vh] flex items-center justify-center px-4">
      <div class="text-center">
        <!-- 404 Illustration -->
        <div class="mb-8">
          <span class="text-9xl font-bold text-indigo-600/20">404</span>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h1>
        <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for.
          It might have been moved or doesn't exist.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/">
            <AppButton size="lg">
              <Home class="w-5 h-5" />
              Go to Home
            </AppButton>
          </router-link>
          <button @click="$router.back()">
            <AppButton variant="outline" size="lg">
              <ArrowLeft class="w-5 h-5" />
              Go Back
            </AppButton>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
