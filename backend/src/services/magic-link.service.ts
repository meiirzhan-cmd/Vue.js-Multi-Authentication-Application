import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { prisma } from "../database.js";
import type { MagicLinkPayload } from "../types/index.js";
import { RedisUtils } from "../utils/redis-utils.js";

export class MagicLinkService {
  private static readonly EXPIRES_IN_SECONDS = 15 * 60; // 15 minutes
  private static readonly EXPIRES_IN_MS = 15 * 60 * 1000;

  private static readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendMagicLink(email: string): Promise<boolean> {
    try {
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      user ??= await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          provider: "MAGIC_LINK",
          emailVerified: false,
        },
      });

      // Generate secure token
      const tokenId = crypto.randomBytes(32).toString("hex");

      const payload: MagicLinkPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = jwt.sign(
        { ...payload, jti: tokenId },
        process.env.MAGIC_LINK_SECRET!,
        { expiresIn: "15m" },
      );

      // Store in Redis
      await RedisUtils.storeMagicLinkToken(
        tokenId,
        user.id,
        this.EXPIRES_IN_SECONDS,
      );

      // Store in database
      await prisma.magicLink.create({
        data: {
          token: tokenId,
          userId: user.id,
          expiresAt: new Date(Date.now() + this.EXPIRES_IN_MS),
        },
      });

      // Send email
      const magicLinkUrl = `${process.env.FRONTEND_URL}/auth/magic-link/verify?token=${token}`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Magic Login Link",
        html: `
          
            Login to Your Account
            Click the button below to log in. This link will expire in 15 minutes.
            
              Log In
            
            
              If you didn't request this link, you can safely ignore this email.
            
            
              Or copy this link: ${magicLinkUrl}
            
          
        `,
      });

      return true;
    } catch (error) {
      console.error("Magic link error:", error);
      return false;
    }
  }

  static async verifyMagicLink(token: string): Promise<{ userId: string; email: string } | null> {
    try {
      const payload = jwt.verify(
        token,
        process.env.MAGIC_LINK_SECRET!,
      ) as MagicLinkPayload & { jti: string };

      // Check Redis
      const storedUserId = await RedisUtils.consumeMagicLinkToken(payload.jti);

      if (!storedUserId || storedUserId !== payload.userId) {
        return null;
      }

      // Mark as used in database
      await prisma.magicLink.update({
        where: { token: payload.jti },
        data: { used: true },
      });

      // Mark email as verified
      await prisma.user.update({
        where: { id: payload.userId },
        data: { emailVerified: true },
      });

      return { userId: payload.userId, email: payload.email };
    } catch {
      return null;
    }
  }
}
