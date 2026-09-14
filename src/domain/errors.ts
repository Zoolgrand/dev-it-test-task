export type ApiErrorCode =
  | "unauthorized"
  | "not_found"
  | "malformed_body"
  | "payload_too_large"
  | "validation_failed"
  | "version_conflict"
  | "rate_limited"
  | "provider_unavailable";

export type FieldErrors = Record<string, string>;

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
};
