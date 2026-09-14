import "server-only";
import { malformedBody, payloadTooLarge } from "./responses";

export const MAX_BODY_BYTES = 64 * 1024;

export type JsonBodyResult =
  { status: "ok"; value: unknown } | { status: "malformed" } | { status: "too_large" };

function declaredLengthExceedsLimit(request: Request): boolean {
  const header = request.headers.get("content-length");

  if (header === null) {
    return false;
  }

  const declared = Number(header);

  return Number.isFinite(declared) && declared > MAX_BODY_BYTES;
}

async function readBoundedText(body: ReadableStream<Uint8Array>): Promise<string | null> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";

  for (;;) {
    const chunk = await reader.read();

    if (chunk.done) {
      return text + decoder.decode();
    }

    size += chunk.value.byteLength;

    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }

    text += decoder.decode(chunk.value, { stream: true });
  }
}

export function bodyErrorResponse(result: Exclude<JsonBodyResult, { status: "ok" }>): Response {
  return result.status === "too_large" ? payloadTooLarge() : malformedBody();
}

export async function parseJsonBody(request: Request): Promise<JsonBodyResult> {
  if (declaredLengthExceedsLimit(request)) {
    return { status: "too_large" };
  }

  if (!request.body) {
    return { status: "malformed" };
  }

  const text = await readBoundedText(request.body);

  if (text === null) {
    return { status: "too_large" };
  }

  try {
    return { status: "ok", value: JSON.parse(text) };
  } catch {
    return { status: "malformed" };
  }
}
