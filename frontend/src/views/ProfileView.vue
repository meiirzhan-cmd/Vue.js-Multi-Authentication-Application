<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/api.js";
import { AppLayout } from "@/components/layout";
import { AppButton, AppInput, AppAlert, AppCard } from "@/components/ui";
import {
  User,
  Mail,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  Shield,
  LogOut,
} from "lucide-vue-next";

const authStore = useAuthStore();
const user = computed(() => authStore.user);

// Profile form state
const profileForm = ref({
  name: user.value?.name || "",
  avatar: user.value?.avatar || "",
});
const isProfileLoading = ref(false);
const profileSuccess = ref(false);
const profileError = ref("");

// Password form state
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isPasswordLoading = ref(false);
const passwordSuccess = ref(false);
const passwordError = ref("");

// Watch for user changes
watch(
  user,
  (newUser) => {
    if (newUser) {
      profileForm.value.name = newUser.name || "";
      profileForm.value.avatar = newUser.avatar || "";
    }
  },
  { immediate: true },
);

// User initials
const userInitials = computed(() => {
  if (!user.value?.name)
    return user.value?.email?.charAt(0).toUpperCase() || "U";
  return user.value.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Password requirements
const passwordRequirements = computed(() => [
  {
    met: passwordForm.value.newPassword.length >= 8,
    text: "At least 8 characters",
  },
  {
    met: /[A-Z]/.test(passwordForm.value.newPassword),
    text: "One uppercase letter",
  },
  {
    met: /[a-z]/.test(passwordForm.value.newPassword),
    text: "One lowercase letter",
  },
  { met: /\d/.test(passwordForm.value.newPassword), text: "One number" },
]);

const isNewPasswordValid = computed(() =>
  passwordRequirements.value.every((req) => req.met),
);

const passwordsMatch = computed(
  () =>
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    passwordForm.value.confirmPassword !== "",
);

const canChangePassword = computed(
  () =>
    passwordForm.value.currentPassword &&
    isNewPasswordValid.value &&
    passwordsMatch.value &&
    !isPasswordLoading.value,
);

// Update profile
async function handleProfileUpdate() {
  profileError.value = "";
  profileSuccess.value = false;
  isProfileLoading.value = true;

  try {
    const response = await authApi.updateProfile({
      name: profileForm.value.name,
      avatar: profileForm.value.avatar || undefined,
    });

    // Update the store with new user data
    authStore.user = response.data.user;
    profileSuccess.value = true;

    setTimeout(() => {
      profileSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    profileError.value =
      err.response?.data?.message || "Failed to update profile";
  } finally {
    isProfileLoading.value = false;
  }
}

// Change password
async function handlePasswordChange() {
  if (!canChangePassword.value) return;

  passwordError.value = "";
  passwordSuccess.value = false;
  isPasswordLoading.value = true;

  try {
    await authApi.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    passwordSuccess.value = true;
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    setTimeout(() => {
      passwordSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    passwordError.value =
      err.response?.data?.message || "Failed to change password";
  } finally {
    isPasswordLoading.value = false;
  }
}

// Logout all devices
async function handleLogoutAllDevices() {
  if (!confirm("This will sign you out from all devices. Continue?")) return;
  await authStore.logoutAllDevices();
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          Profile Settings
        </h1>
        <p class="mt-1 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Profile Information -->
        <AppCard>
          <h2
            class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"
          >
            <User class="w-5 h-5" />
            Profile Information
          </h2>

          <AppAlert v-if="profileSuccess" variant="success" class="mb-6">
            Profile updated successfully!
          </AppAlert>

          <AppAlert v-if="profileError" variant="error" class="mb-6">
            {{ profileError }}
          </AppAlert>

          <form @submit.prevent="handleProfileUpdate" class="space-y-6">
            <!-- Avatar Preview -->
            <div class="flex items-center gap-6">
              <div class="relative">
                <div
                  v-if="profileForm.avatar"
                  class="w-20 h-20 rounded-full bg-cover bg-center ring-4 ring-gray-100"
                  :style="{ backgroundImage: `url(${profileForm.avatar})` }"
                />
                <div
                  v-else
                  class="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center ring-4 ring-gray-100"
                >
                  <span class="text-xl font-semibold text-indigo-600">
                    {{ userInitials }}
                  </span>
                </div>
                <div
                  class="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md"
                >
                  <Camera class="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div class="flex-1">
                <AppInput
                  v-model="profileForm.avatar"
                  label="Avatar URL"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  hint="Enter a URL to your profile picture"
                />
              </div>
            </div>

            <!-- Name -->
            <AppInput
              v-model="profileForm.name"
              label="Full name"
              type="text"
              placeholder="John Doe"
            />

            <!-- Email (read-only) -->
            <div class="space-y-1">
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Email address</label
              >
              <div class="flex items-center gap-2">
                <input
                  id="email"
                  :value="user?.email"
                  type="email"
                  disabled
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <Mail class="w-5 h-5 text-gray-400" />
              </div>
              <p class="text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div class="flex justify-end">
              <AppButton type="submit" :loading="isProfileLoading">
                Save Changes
              </AppButton>
            </div>
          </form>
        </AppCard>

        <!-- Change Password (only for LOCAL provider) -->
        <AppCard v-if="user?.provider === 'LOCAL'">
          <h2
            class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"
          >
            <Shield class="w-5 h-5" />
            Change Password
          </h2>

          <AppAlert v-if="passwordSuccess" variant="success" class="mb-6">
            Password changed successfully!
          </AppAlert>

          <AppAlert v-if="passwordError" variant="error" class="mb-6">
            {{ passwordError }}
          </AppAlert>

          <form @submit.prevent="handlePasswordChange" class="space-y-5">
            <!-- Current Password -->
            <div class="space-y-1">
              <label for="current-password" class="block text-sm font-medium text-gray-700"
                >Current password</label
              >
              <div class="relative">
                <input
                  id="current-password"
                  v-model="passwordForm.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showCurrentPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="space-y-1">
              <label for="new-password" class="block text-sm font-medium text-gray-700"
                >New password</label
              >
              <div class="relative">
                <input
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showNewPassword" class="w-5 h-5" />
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

            <!-- Confirm New Password -->
            <div class="space-y-1">
              <label for="confirm-password" class="block text-sm font-medium text-gray-700"
                >Confirm new password</label
              >
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  class="block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  :class="
                    passwordForm.confirmPassword && !passwordsMatch
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
                v-if="passwordForm.confirmPassword && !passwordsMatch"
                class="text-sm text-red-600"
              >
                Passwords do not match
              </p>
            </div>

            <div class="flex justify-end">
              <AppButton
                type="submit"
                :loading="isPasswordLoading"
                :disabled="!canChangePassword"
              >
                Change Password
              </AppButton>
            </div>
          </form>
        </AppCard>

        <!-- Security Actions -->
        <AppCard>
          <h2
            class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"
          >
            <LogOut class="w-5 h-5" />
            Session Management
          </h2>

          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">Sign out all devices</p>
                <p class="text-sm text-gray-500">
                  This will sign you out from all devices except the current
                  one.
                </p>
              </div>
              <AppButton variant="danger" @click="handleLogoutAllDevices">
                Sign out all
              </AppButton>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </AppLayout>
</template>
