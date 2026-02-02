# Frontend

Vue.js 3 Single Page Application with multi-authentication support.

## Tech Stack

- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite 7
- **State Management:** Pinia
- **Routing:** Vue Router 5
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Icons:** Lucide Vue Next

## Project Structure

```text
frontend/
├── src/
│   ├── App.vue                  # Root component
│   ├── main.js                  # Application entry point
│   ├── __tests__/               # Test files
│   │   ├── setup.ts             # Test setup and mocks
│   │   ├── stores/              # Store tests
│   │   └── components/          # Component tests
│   ├── components/
│   │   ├── icons/
│   │   │   └── GoogleIcon.vue   # Google logo icon
│   │   ├── layout/
│   │   │   ├── AppLayout.vue    # Main app wrapper
│   │   │   ├── AuthLayout.vue   # Auth pages wrapper
│   │   │   └── Navbar.vue       # Navigation bar
│   │   └── ui/                  # Reusable UI components
│   │       ├── AppAlert.vue     # Alert/notification
│   │       ├── AppButton.vue    # Button component
│   │       ├── AppCard.vue      # Card container
│   │       ├── AppInput.vue     # Form input
│   │       ├── LoadingSpinner.vue
│   │       └── index.ts         # Component exports
│   ├── views/
│   │   ├── HomeView.vue         # Landing page
│   │   ├── DashboardView.vue    # User dashboard
│   │   ├── ProfileView.vue      # User profile & settings
│   │   ├── NotFoundView.vue     # 404 page
│   │   └── auth/
│   │       ├── LoginView.vue    # Login page
│   │       ├── RegisterView.vue # Registration page
│   │       ├── MagicLinkView.vue
│   │       ├── MagicLinkVerifyView.vue
│   │       └── OAuthCallbackView.vue
│   ├── router/
│   │   └── index.ts             # Route definitions
│   ├── stores/
│   │   └── auth.ts              # Pinia auth store
│   └── lib/
│       └── api.ts               # Axios API client
├── index.html
├── vite.config.js
├── tailwind.config.ts
├── Dockerfile
└── nginx.conf
```

## Getting Started

### Prerequisites

- Node.js 20+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start development server on port 3001 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## Testing

The project uses [Vitest](https://vitest.dev/) with [Vue Test Utils](https://test-utils.vuejs.org/) for unit and component testing.

### Test Structure

```text
src/__tests__/
├── setup.ts                    # Test setup (mocks for localStorage, location)
├── stores/
│   └── auth.spec.ts            # Auth store tests (30 tests)
└── components/
    ├── AppButton.spec.ts       # Button component tests (26 tests)
    ├── AppInput.spec.ts        # Input component tests (21 tests)
    └── AppAlert.spec.ts        # Alert component tests (17 tests)
```

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Tests follow this pattern:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MyComponent from "../../components/MyComponent.vue";

describe("MyComponent", () => {
  it("should render correctly", () => {
    const wrapper = mount(MyComponent, {
      props: { title: "Hello" },
    });
    expect(wrapper.text()).toContain("Hello");
  });
});
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## Pages

### Public Pages

- `/` - Landing page with feature overview
- `/404` - Not found page

### Guest Pages (Unauthenticated only)

- `/login` - Login with password, magic link, or Google
- `/register` - Create new account
- `/magic-link` - Request magic link email
- `/magic-link/verify` - Verify magic link token
- `/auth/callback` - OAuth callback handler

### Protected Pages (Authenticated only)

- `/dashboard` - User dashboard with account overview
- `/profile` - Profile settings, password change, session management

## State Management

The auth store (`stores/auth.ts`) manages:

### State

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}
```

### Actions

- `register(data)` - Create new account
- `login(email, password)` - Login with credentials
- `loginWithGoogle()` - Redirect to Google OAuth
- `sendMagicLink(email)` - Request magic link email
- `verifyMagicLink(token)` - Verify magic link
- `refreshTokens()` - Refresh JWT tokens
- `fetchUser()` - Get current user data
- `updateProfile(data)` - Update user profile
- `changePassword(data)` - Change password
- `logout()` - Logout current session
- `logoutAllDevices()` - Logout from all devices

### Getters

- `isAuthenticated` - Check if user is logged in
- `isEmailVerified` - Check if email is verified

## API Client

The API client (`lib/api.ts`) provides:

- Automatic token injection in headers
- Automatic token refresh on 401 errors
- Redirect to login on authentication failure

### Usage

```typescript
import api from '@/lib/api'

// Make authenticated request
const response = await api.get('/auth/me')

// Use wrapper methods
import { authApi } from '@/lib/api'
const user = await authApi.getMe()
```

## Components

### Layout Components

- `AppLayout` - Main layout with navbar and footer
- `AuthLayout` - Centered card layout for auth pages
- `Navbar` - Navigation with user menu

### UI Components

- `AppButton` - Button with variants (primary, secondary, outline, danger)
- `AppInput` - Form input with label and error handling
- `AppCard` - Card container with optional title
- `AppAlert` - Alert messages (success, error, warning, info)
- `LoadingSpinner` - Loading indicator

### Usage Example

```vue
<template>
  <AppLayout>
    <AppCard title="My Card">
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />
      <AppButton variant="primary" @click="submit">
        Submit
      </AppButton>
    </AppCard>
  </AppLayout>
</template>
```

## Router Guards

Routes are protected using meta fields:

```typescript
// Requires authentication
{
  path: '/dashboard',
  meta: { requiresAuth: true }
}

// Guest only (redirects authenticated users)
{
  path: '/login',
  meta: { guest: true }
}
```

## Styling

The project uses Tailwind CSS 4 with:

- Custom color palette
- Responsive design utilities
- Dark mode support (optional)

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          // Custom primary colors
        }
      }
    }
  }
}
```

## Docker

Build and run:

```bash
docker build -t multiauth-frontend .
docker run -p 80:80 multiauth-frontend
```

The Dockerfile:

1. Builds the Vue app with Vite
2. Serves static files with Nginx
3. Configures SPA routing (all routes serve index.html)

### Nginx Configuration

The `nginx.conf` handles:

- Gzip compression
- Static file caching
- SPA routing fallback
- Reverse proxy to backend API (optional)
