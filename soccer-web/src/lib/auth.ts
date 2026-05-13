const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const AUTH_COOKIE_NAME = "soccer_planner_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  photoUrl: string | null;
  iat: number;
  exp: number;
};

function getCrypto() {
  const cryptoImpl = globalThis.crypto;

  if (!cryptoImpl?.subtle) {
    throw new Error("Web Crypto is required for auth helpers.");
  }

  return cryptoImpl;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required to sign and verify auth tokens.");
  }

  return secret;
}

function base64UrlEncode(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getSigningKey() {
  const cryptoImpl = getCrypto();

  return cryptoImpl.subtle.importKey(
    "raw",
    encoder.encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signJwt(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
  expiresInSeconds = AUTH_COOKIE_MAX_AGE,
) {
  const cryptoImpl = getCrypto();
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const fullPayload: AuthTokenPayload = {
    ...payload,
    iat,
    exp: iat + expiresInSeconds,
  };
  const signingInput = `${base64UrlEncode(encoder.encode(JSON.stringify(header)))}.${base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)))}`;
  const key = await getSigningKey();
  const signature = await cryptoImpl.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyJwt(token: string) {
  const cryptoImpl = getCrypto();
  const [headerSegment, payloadSegment, signatureSegment, ...rest] = token.split(".");

  if (!headerSegment || !payloadSegment || !signatureSegment || rest.length > 0) {
    return null;
  }

  const key = await getSigningKey();
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signature = base64UrlDecode(signatureSegment);
  const isValid = await cryptoImpl.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(signingInput),
  );

  if (!isValid) {
    return null;
  }

  let payload: AuthTokenPayload;

  try {
    payload = JSON.parse(decoder.decode(base64UrlDecode(payloadSegment))) as AuthTokenPayload;
  } catch {
    return null;
  }

  if (!payload?.sub || !payload?.email || !payload?.name) {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
