<script setup lang="ts">
import { computed, useAttrs } from "vue";

interface Props {
  modelValue?: string;
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const attrs = useAttrs();

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`);

const inputClasses = computed(() => {
  const base =
    "block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
  const errorClass = props.error
    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300";
  return `${base} ${errorClass}`;
});

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :value="modelValue"
        :class="inputClasses"
        v-bind="attrs"
        @input="handleInput"
      />
      <slot name="suffix" />
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>
