<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AuthLayout } from "@/components/layout";
import { AppButton, AppInput, AppAlert, AppCard } from "@/components/ui";
import { Eye, EyeOff, Check, X } from "lucide-vue-next";
import GoogleIcon from "@/components/icons/GoogleIcon.vue";

const router = useRouter();
const authStore = useAuthStore();

// Form state
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreedToTerms = ref(false);

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

// Password requirements
const passwordRequirements = computed(() => [
  { met: password.value.length >= 8, text: "At least 8 characters" },
  { met: /[A-Z]/.test(password.value), text: "One uppercase letter" },
  { met: /[a-z]/.test(password.value), text: "One lowercase letter" },
  { met: /[0-9]/.test(password.value), text: "One number" },
]);

const isPasswordValid = computed(() =>
  passwordRequirements.value.every((req) => req.met)
);

const passwordsMatch = computed(
  () => password.value === confirmPassword.value && confirmPassword.value !== ""
);

const canSubmit = computed(
  () =>
    email.value &&
    name.value &&
    isPasswordValid.value &&
    passwordsMatch.value &&
    agreedToTerms.value &&
    !isLoading.value
);

// Submit handler
async function handleRegister() {
  if (!canSubmit.value) return;

  const success = await authStore.register(email.value, password.value, name.value);

  if (success) {
    router.push("/dashboard");
  }
}

// Google OAuth
function handleGoogleLogin() {
  authStore.loginWithGoogle();
}
</script>

<template>
  <AuthLayout>
    <AppCard>
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Create your account</h1>
        <p class="mt-2 text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-indigo-600 hover:text-indigo-500">
            Sign in
          </router-link>
        </p>
      </div>

      <!-- Error Message -->
      <AppAlert v-if="error" variant="error" class="mb-6">
        {{ error }}
      </AppAlert>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <!-- Name -->
        <AppInput
          v-model="name"
          label="Full name"
          type="text"
          autocomplete="name"
          placeholder="John Doe"
          required
        />

        <!-- Email -->
        <AppInput
          v-model="email"
          label="Email address"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />

        <!-- Password -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <EyeOff v-if="showPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <!-- Password Requirements -->
          <ul class="mt-2 space-y-1">
            <li
              v-for="req in passwordRequirements"
              :key="req.text"
              class="flex items-center gap-2 text-sm"
              :class="req.met ? 'text-green-600' : 'text-gray-500'"
            >
              <Check v-if="req.met" class="w-4 h-4" />
              <X v-else class="w-4 h-4" />
              {{ req.text }}
            </li>
          </ul>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">Confirm password</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              class="block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              :class="
                confirmPassword && !passwordsMatch
                  ? 'border-red-300'
                  : 'border-gray-300'
              "
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <EyeOff v-if="showConfirmPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <p
            v-if="confirmPassword && !passwordsMatch"
            class="text-sm text-red-600"
          >
            Passwords do not match
          </p>
        </div>

        <!-- Terms -->
        <div class="flex items-start gap-3">
          <input
            id="terms"
            v-model="agreedToTerms"
            type="checkbox"
            class="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label for="terms" class="text-sm text-gray-600">
            I agree to the
            <a href="#" class="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
            and
            <a href="#" class="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
          </label>
        </div>

        <!-- Submit Button -->
        <AppButton
          type="submit"
          :loading="isLoading"
          :disabled="!canSubmit"
          full-width
        >
          {{ isLoading ? "Creating account..." : "Create account" }}
        </AppButton>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- Google OAuth -->
      <AppButton
        variant="outline"
        full-width
        @click="handleGoogleLogin"
      >
        <GoogleIcon />
        Continue with Google
      </AppButton>
    </AppCard>
  </AuthLayout>
</template>
