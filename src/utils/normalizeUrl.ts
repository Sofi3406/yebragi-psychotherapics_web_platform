// src/utils/normalizeUrl.ts
export function normalizeUrl(url: string): string {
  const [base,] = url.split("?");
  return base; // removes tracking/query parameters
}
