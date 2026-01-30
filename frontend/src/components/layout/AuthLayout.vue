<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Simple header for auth pages -->
    <header class="py-6 px-4">
      <div class="max-w-md mx-auto">
        <RouterLink to="/" class="flex items-center gap-2 w-fit">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">MA</span>
          </div>
          <span class="font-semibold text-gray-900">MultiAuth</span>
        </RouterLink>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 px-4 text-center text-sm text-gray-500">
      <p>&copy; {{ new Date().getFullYear() }} MultiAuth. All rights reserved.</p>
    </footer>
  </div>
</template>
