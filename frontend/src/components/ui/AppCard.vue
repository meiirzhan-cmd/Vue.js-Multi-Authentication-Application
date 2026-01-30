<script setup lang="ts">
interface Props {
  padding?: "none" | "sm" | "md" | "lg";
}

withDefaults(defineProps<Props>(), {
  padding: "md",
});

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};
</script>

<template>
  <div :class="['bg-white rounded-xl shadow-sm border border-gray-200', paddingClasses[padding]]">
    <slot />
  </div>
</template>
