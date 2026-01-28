import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  type StrategyOptions,
} from "passport-jwt";
import bcrypt from "bcryptjs";
import { prisma } from "../database.js";
import type { JWTPayload, SafeUser } from "../types/index.js";

// Serialize user to session
passport.serializeUser((user: SafeUser, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Strategy 1: Local (Email/Password)
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user?.password) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const { password: _, ...safeUser } = user;
        return done(null, safeUser);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Strategy 2: Google OAuth 2.0
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email provided by Google"), undefined);
        }

        // Check if user exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email.toLowerCase() },
              { providerId: profile.id, provider: "GOOGLE" },
            ],
          },
        });

        if (user) {
          // Update existing user with Google info if needed
          if (user.provider !== "GOOGLE") {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: "GOOGLE",
                providerId: profile.id,
                emailVerified: true,
                avatar: user.avatar ?? profile.photos?.[0]?.value ?? null,
              },
            });
          }
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: email.toLowerCase(),
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value ?? null,
              provider: "GOOGLE",
              providerId: profile.id,
              emailVerified: true,
            },
          });
        }

        const { password: _, ...safeUser } = user;
        return done(null, safeUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

// Strategy 3: JWT (for API authentication)
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  algorithms: ["HS256"],
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (payload: JWTPayload, done) => {
    try {
      if (payload.type !== "access") {
        return done(null, false, { message: "Invalid token type" });
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
          provider: true,
          providerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport; // NOSONAR
