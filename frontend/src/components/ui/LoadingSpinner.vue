<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

withDefaults(defineProps<Props>(), {
  size: "md",
});

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <Loader2 :class="[sizeClasses[size], 'animate-spin text-indigo-600']" />
    <p v-if="text" class="text-sm text-gray-600">{{ text }}</p>
  </div>
</template>
