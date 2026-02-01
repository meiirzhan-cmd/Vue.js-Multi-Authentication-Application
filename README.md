# Vue Multi-Auth

A complete multi-authentication solution built with Vue.js 3, Express.js, and TypeScript. Supports password login, magic link (passwordless), and Google OAuth authentication methods.

![Home Page](screenshots/image5.png)

## Features

- **Multiple Authentication Methods**
  - Email & Password authentication
  - Magic Link (passwordless) authentication
  - Google OAuth 2.0

- **Security**
  - JWT-based authentication with refresh tokens
  - Session management with Redis
  - Rate limiting on login attempts
  - Password hashing with bcrypt
  - CORS and Helmet.js security headers

- **User Management**
  - User registration and login
  - Profile management
  - Password change
  - Sign out from all devices

## Screenshots

### Login Page
![Login](screenshots/image3.png)

### Registration Page
![Register](screenshots/image4.png)

### Dashboard
![Dashboard](screenshots/image.png)

### Profile Settings
![Profile](screenshots/image2.png)

## Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js 5
- **Language:** TypeScript
- **Database:** PostgreSQL 15 + Prisma ORM
- **Cache:** Redis 7
- **Authentication:** Passport.js (Local, Google, JWT strategies)

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite 7
- **State Management:** Pinia
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Icons:** Lucide Vue

### Infrastructure
- Docker & Docker Compose
- Nginx (production)
- GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for local development with databases)
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/meiirzhan-cmd/Vue.js-Multi-Authentication-Application.git
   cd vue-multi-auth
   ```

2. **Start databases with Docker**
   ```bash
   docker compose up -d postgres redis
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npx prisma migrate dev
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multiauth"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# Session & JWT
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Magic Link
MAGIC_LINK_SECRET=your-magic-link-secret
MAGIC_LINK_EXPIRES_IN=15m

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# SMTP (for magic links)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EMAIL_FROM=noreply@example.com
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Docker Deployment

### Build and run with Docker Compose
```bash
docker compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- Backend API server
- Frontend with Nginx

### Production Deployment

The project includes GitHub Actions workflows for CI/CD:

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs tests for backend and frontend
   - Security scanning with Trivy
   - Builds and pushes Docker images to GitHub Container Registry

2. **Deploy Pipeline** (`.github/workflows/deploy.yml`)
   - Triggered after successful CI on main branch
   - SSH deployment to production server
   - Runs database migrations
   - Health check verification

## Project Structure

```
vue-multi-auth/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Passport, session, Redis config
│   │   ├── middleware/     # Auth, security, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema & migrations
│   └── Dockerfile
├── frontend/               # Vue.js SPA
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── views/          # Page components
│   │   ├── stores/         # Pinia stores
│   │   ├── router/         # Vue Router config
│   │   └── lib/            # API client
│   └── Dockerfile
├── screenshots/            # Application screenshots
├── docker-compose.yml      # Docker orchestration
└── .github/workflows/      # CI/CD pipelines
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/magic-link/send` | Send magic link email |
| POST | `/api/auth/magic-link/verify` | Verify magic link token |
| POST | `/api/auth/refresh` | Refresh JWT tokens |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update user profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/logout` | Logout current session |
| POST | `/api/auth/logout-all` | Logout from all devices |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
