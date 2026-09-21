function pad(n: number, size: number) {
  return String(n).padStart(size, '0');
}

/**
 * Generates a reasonably unique, human-readable document number, e.g. INV-20260910-4F3A.
 * Callers should still handle unique-constraint violations (Postgres code 23505) since this
 * is not a guaranteed-atomic sequence.
 */
export function generateDocumentNumber(prefix: string): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const randomPart = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}
