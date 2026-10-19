import type { SpendingEntryFields } from "./spendingEntries";

export const spendingEntryCategories = [
  "Rides",
  "Shopping",
  "Food delivery",
  "Entertainment",
  "Other",
] as const;

export function parseSpendingEntryFields(value: unknown): SpendingEntryFields | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const fields = value as Record<string, unknown>;
  const { amount, date, category } = fields;
  const merchant = fields.merchant === undefined ? "" : fields.merchant;
  const note = fields.note === undefined ? "" : fields.note;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0.01 || amount > 100_000) {
    return null;
  }

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime())
    || parsedDate.toISOString().slice(0, 10) !== date
    || date > new Date().toISOString().slice(0, 10)
  ) {
    return null;
  }

  if (
    typeof category !== "string"
    || !spendingEntryCategories.some((allowedCategory) => allowedCategory === category)
  ) {
    return null;
  }

  if (
    typeof merchant !== "string"
    || merchant.length > 200
    || typeof note !== "string"
    || note.length > 200
  ) {
    return null;
  }

  return { amount, date, category, merchant, note };
}
