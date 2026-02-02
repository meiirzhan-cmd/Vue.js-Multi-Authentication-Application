# Backend API

Express.js REST API with multi-authentication support (password, magic link, Google OAuth).

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js 5
- **Language:** TypeScript
- **Database:** PostgreSQL 15 + Prisma ORM
- **Cache:** Redis 7
- **Authentication:** Passport.js

## Project Structure

```text
backend/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── database.ts           # Prisma client initialization
│   ├── __tests__/            # Test files
│   │   ├── setup.ts          # Test setup and mocks
│   │   ├── jwt.spec.ts       # JWT service tests
│   │   └── auth.spec.ts      # Auth/password tests
│   ├── config/
│   │   ├── passport.ts       # Passport strategies (Local, Google, JWT)
│   │   ├── session.ts        # Express-session middleware
│   │   └── redis.ts          # Redis connection
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── security.ts       # CORS, Helmet, rate limiting
│   │   └── validation.ts     # Input validation
│   ├── routes/
│   │   └── auth.routes.ts    # All authentication endpoints
│   ├── services/
│   │   ├── auth.service.ts   # User registration, login
│   │   ├── jwt.service.ts    # JWT token management
│   │   └── magic-link.service.ts # Magic link generation
│   ├── utils/
│   │   └── redis-utils.ts    # Redis operations
│   └── types/
│       └── index.ts          # TypeScript definitions
├── prisma/
│   └── schema.prisma         # Database schema
├── Dockerfile
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15
- Redis 7

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run linter |

## Testing

The project uses [Vitest](https://vitest.dev/) for unit testing.

### Test Structure

```text
src/__tests__/
├── setup.ts        # Test setup (mocks for Redis, Prisma)
├── jwt.spec.ts     # JWT token generation/verification tests (11 tests)
└── auth.spec.ts    # Password hashing and validation tests (6 tests)
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multiauth"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# Session
SESSION_SECRET=your-session-secret-min-32-chars

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d

# Magic Link
MAGIC_LINK_SECRET=your-magic-link-secret-min-32-chars
MAGIC_LINK_EXPIRES_IN=15m

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# SMTP (for magic links)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@example.com
```

## API Endpoints

### Authentication Routes

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Google OAuth

```http
GET /api/auth/google
```

Redirects to Google OAuth consent screen.

#### Magic Link

Send magic link:

```http
POST /api/auth/magic-link/send
Content-Type: application/json

{
  "email": "john@example.com"
}
```

Verify magic link:

```http
POST /api/auth/magic-link/verify
Content-Type: application/json

{
  "token": "jwt-magic-link-token"
}
```

#### Token Refresh

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### User Routes (Authenticated)

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

#### Update Profile

```http
PATCH /api/auth/me
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "New Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

#### Logout All Devices

```http
POST /api/auth/logout-all
Authorization: Bearer <access-token>
```

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  avatar        String?
  emailVerified Boolean   @default(false)
  provider      Provider  @default(LOCAL)
  providerId    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  magicLinks    MagicLink[]
  refreshTokens RefreshToken[]
}

enum Provider {
  LOCAL
  GOOGLE
  MAGIC_LINK
}
```

## Authentication Flow

### JWT Authentication

1. User logs in with credentials
2. Server validates credentials
3. Server generates access token (15min) and refresh token (7days)
4. Client stores tokens and sends access token in Authorization header
5. When access token expires, client uses refresh token to get new tokens

### Magic Link Flow

1. User enters email
2. Server generates secure token and sends email
3. User clicks link with token
4. Server validates token and logs user in
5. Token is marked as used (one-time use)

### Google OAuth Flow

1. User clicks "Continue with Google"
2. Server redirects to Google consent screen
3. Google redirects back with authorization code
4. Server exchanges code for user info
5. Server creates/finds user and generates JWT tokens

## Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **Rate Limiting:** 5 failed login attempts per 15 minutes
- **Input Sanitization:** XSS protection on all inputs
- **CORS:** Configured for frontend origin only
- **Helmet.js:** Secure HTTP headers
- **JWT:** Short-lived access tokens with refresh rotation
- **Session:** Redis-backed with secure cookies

## Docker

Build and run:

```bash
docker build -t multiauth-backend .
docker run -p 3000:3000 multiauth-backend
```

The Dockerfile uses multi-stage builds for smaller production images.
