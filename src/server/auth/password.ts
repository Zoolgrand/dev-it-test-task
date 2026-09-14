import "server-only";
import { hash, verify } from "@node-rs/argon2";

const DUMMY_HASH_ROUNDS = { algorithm: 2 } as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, DUMMY_HASH_ROUNDS);
}

export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plain);
  } catch {
    return false;
  }
}

const dummyHash = await hashPassword("dummy-password-for-timing-parity");

export async function consumeDummyVerification(plain: string): Promise<void> {
  await verifyPassword(dummyHash, plain);
}
