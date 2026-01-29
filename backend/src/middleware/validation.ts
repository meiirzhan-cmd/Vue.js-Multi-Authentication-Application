import type { Request, Response, NextFunction } from "express";

interface ValidationError {
  field: string;
  message: string;
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Password validation (OWASP recommendations)
function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < 12) {
    errors.push({
      field: "password",
      message: "Password must be at least 12 characters",
    });
  }
  if (password.length > 128) {
    errors.push({
      field: "password",
      message: "Password must not exceed 128 characters",
    });
  }
  if (!/[a-z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain a lowercase letter",
    });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain an uppercase letter",
    });
  }
  if (!/\d/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain a number",
    });
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain a special character",
    });
  }

  return errors;
}

// Registration validation
export function validateRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { email, password, name } = req.body;
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (password) {
    errors.push(...validatePassword(password));
  } else {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (name && name.length > 100) {
    errors.push({
      field: "name",
      message: "Name must not exceed 100 characters",
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
}

// Login validation
export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { email, password } = req.body;
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
}

// Magic link validation
export function validateMagicLink(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  next();
}
