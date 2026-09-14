import "server-only";
import { hash, verify } from "@node-rs/argon2";

const ARGON2ID = 2;

const ARGON2_OPTIONS = { algorithm: ARGON2ID } as const;

const DUMMY_PASSWORD = "dummy-password-for-timing-parity";

let dummyHash: Promise<string> | null = null;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plain);
  } catch {
    return false;
  }
}

export async function consumeDummyVerification(plain: string): Promise<void> {
  dummyHash ??= hashPassword(DUMMY_PASSWORD);
  await verifyPassword(await dummyHash, plain);
}
