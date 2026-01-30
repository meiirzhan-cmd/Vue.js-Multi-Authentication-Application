<script setup lang="ts">
import Navbar from "./Navbar.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="py-6 px-4 border-t border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto text-center text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} MultiAuth. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
