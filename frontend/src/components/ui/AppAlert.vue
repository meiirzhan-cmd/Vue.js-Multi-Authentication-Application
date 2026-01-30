<script setup lang="ts">
import { computed } from "vue";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-vue-next";

interface Props {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "info",
  dismissible: false,
});

const emit = defineEmits<{
  dismiss: [];
}>();

const styles = computed(() => {
  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: CheckCircle,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: AlertTriangle,
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-700",
      icon: AlertCircle,
    },
  };
  return variants[props.variant];
});
</script>

<template>
  <div :class="['px-4 py-3 rounded-lg border', styles.container]" role="alert">
    <div class="flex items-start gap-3">
      <component :is="styles.icon" class="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div class="flex-1 min-w-0">
        <p v-if="title" class="font-medium">{{ title }}</p>
        <div :class="title ? 'mt-1' : ''">
          <slot />
        </div>
      </div>
      <button
        v-if="dismissible"
        @click="emit('dismiss')"
        class="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
