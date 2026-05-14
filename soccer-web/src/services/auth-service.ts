import bcrypt from "bcryptjs";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db, users } from "@/db";
import { AUTH_COOKIE_NAME, signJwt, verifyJwt } from "@/lib/auth";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  photoUrl: string | null;
};

type AuthSuccess = {
  success: true;
  user: AuthUser;
  token: string;
};

type AuthFailure = {
  success: false;
  error: string;
};

export type AuthResult = AuthSuccess | AuthFailure;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function validateEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

function getAuthDatabaseErrorMessage() {
  return "We can't reach the account database right now. Please try again after the database is migrated and available.";
}

function logAuthDatabaseError(context: string, error: unknown) {
  console.error(`[auth-service] ${context}`, error);
}

function toAuthUser(user: {
  id: number;
  email: string;
  name: string;
  photoUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
  } satisfies AuthUser;
}

async function createToken(user: AuthUser) {
  return signJwt({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
  });
}

async function getUserByEmail(email: string) {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      photoUrl: users.photoUrl,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return rows[0] ?? null;
}

export async function getUserById(userId: number): Promise<AuthUser | null> {
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        photoUrl: users.photoUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = rows[0];

    return user ? toAuthUser(user) : null;
  } catch (error) {
    logAuthDatabaseError("getUserById: user lookup failed", error);
    return null;
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) {
    return { success: false, error: "Please enter your full name." };
  }

  if (!validateEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  let existingUser;

  try {
    existingUser = await getUserByEmail(email);
  } catch (error) {
    logAuthDatabaseError("registerUser: user lookup failed", error);
    return { success: false, error: getAuthDatabaseErrorMessage() };
  }

  if (existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let createdUsers;

  try {
    createdUsers = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        photoUrl: users.photoUrl,
      });
  } catch (error) {
    logAuthDatabaseError("registerUser: user insert failed", error);
    return { success: false, error: getAuthDatabaseErrorMessage() };
  }

  const createdUser = createdUsers[0];

  if (!createdUser) {
    return { success: false, error: "Unable to create your account right now." };
  }

  const user = toAuthUser(createdUser);

  return {
    success: true,
    user,
    token: await createToken(user),
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!validateEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!password) {
    return { success: false, error: "Please enter your password." };
  }

  let user;

  try {
    user = await getUserByEmail(email);
  } catch (error) {
    logAuthDatabaseError("loginUser: user lookup failed", error);
    return { success: false, error: getAuthDatabaseErrorMessage() };
  }

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { success: false, error: "Invalid email or password." };
  }

  const authUser = toAuthUser(user);

  return {
    success: true,
    user: authUser,
    token: await createToken(authUser),
  };
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return null;
  }

  return getUserById(Number(payload.sub));
});
