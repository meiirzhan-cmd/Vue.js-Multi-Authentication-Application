<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { AppLayout } from "@/components/layout";
import { AppButton } from "@/components/ui";
import {
  Shield,
  Zap,
  Lock,
  Mail,
  Key,
  Fingerprint,
  ArrowRight,
  CheckCircle,
} from "lucide-vue-next";
import GoogleIcon from "@/components/icons/GoogleIcon.vue";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const features = [
  {
    icon: Key,
    title: "Password Authentication",
    description: "Secure email and password login with bcrypt hashing.",
  },
  {
    icon: Mail,
    title: "Magic Link",
    description: "Passwordless login via secure email links.",
  },
  {
    icon: GoogleIcon,
    title: "Google OAuth",
    description: "One-click sign in with your Google account.",
  },
  {
    icon: Shield,
    title: "JWT Tokens",
    description: "Secure access and refresh token management.",
  },
  {
    icon: Zap,
    title: "Session Management",
    description: "Track and manage active sessions across devices.",
  },
  {
    icon: Lock,
    title: "Secure by Default",
    description: "Rate limiting, CORS, and security headers built-in.",
  },
];

const benefits = [
  "Multiple authentication methods in one app",
  "Automatic token refresh",
  "Protected routes with guards",
  "Responsive mobile-first design",
  "TypeScript for type safety",
  "Vue 3 Composition API",
];
</script>

<template>
  <AppLayout>
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div class="text-center">
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
          >
            Multi-Auth
            <span class="text-indigo-600">Made Simple</span>
          </h1>
          <p class="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            A complete authentication solution with password, magic link, and
            OAuth support. Built with Vue 3, TypeScript, and Express.
          </p>
          <div
            class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <router-link v-if="!isAuthenticated" to="/register">
              <AppButton size="lg">
                Get Started
                <ArrowRight class="w-5 h-5" />
              </AppButton>
            </router-link>
            <router-link v-else to="/dashboard">
              <AppButton size="lg">
                Go to Dashboard
                <ArrowRight class="w-5 h-5" />
              </AppButton>
            </router-link>
            <router-link v-if="!isAuthenticated" to="/login">
              <AppButton variant="outline" size="lg"> Sign In </AppButton>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Background decoration -->
      <div class="absolute inset-0 -z-10 overflow-hidden">
        <div
          class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-100/50 blur-3xl"
        />
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">
            Authentication Features
          </h2>
          <p class="mt-4 text-lg text-gray-600">
            Everything you need for secure user authentication
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all"
          >
            <div
              class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4"
            >
              <component :is="feature.icon" class="w-6 h-6 text-indigo-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Built for Developers
            </h2>
            <p class="text-lg text-gray-600 mb-8">
              A clean, well-structured codebase that's easy to understand and
              extend. Perfect as a starter template or learning resource.
            </p>
            <ul class="space-y-4">
              <li
                v-for="benefit in benefits"
                :key="benefit"
                class="flex items-center gap-3"
              >
                <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
                <span class="text-gray-700">{{ benefit }}</span>
              </li>
            </ul>
          </div>
          <div class="bg-gray-900 rounded-xl p-6 text-sm font-mono">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-red-500" />
              <div class="w-3 h-3 rounded-full bg-yellow-500" />
              <div class="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <pre
              class="text-green-400 overflow-x-auto"
            ><code>// Easy to use authentication store
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// Login with email/password
await auth.login(email, password)

// Or use magic link
await auth.sendMagicLink(email)

// Or OAuth
auth.loginWithGoogle()</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-indigo-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Fingerprint class="w-16 h-16 text-indigo-200 mx-auto mb-6" />
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p class="text-lg text-indigo-100 mb-8">
          Create your account today and explore all authentication methods.
        </p>
        <router-link v-if="!isAuthenticated" to="/register">
          <AppButton
            variant="outline"
            size="lg"
            class="border-white! text-black! hover:bg-white/10!"
          >
            Create Free Account
            <ArrowRight class="w-5 h-5" />
          </AppButton>
        </router-link>
        <router-link v-else to="/dashboard">
          <AppButton
            variant="outline"
            size="lg"
            class="border-white! text-black! hover:bg-white/10!"
          >
            Go to Dashboard
            <ArrowRight class="w-5 h-5" />
          </AppButton>
        </router-link>
      </div>
    </section>
  </AppLayout>
</template>
