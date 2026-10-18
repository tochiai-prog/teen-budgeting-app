export type SpendingEntryFields = {
  amount: number;
  date: string;
  category: string;
  merchant: string;
  note: string;
};

export type SpendingEntry = SpendingEntryFields & {
  id: string;
};

type StoreHost = typeof globalThis & {
  teenBudgetingEntries?: Map<string, SpendingEntry[]>;
};

const storeHost = globalThis as StoreHost;
const entriesByDisplayName = storeHost.teenBudgetingEntries ??= new Map<string, SpendingEntry[]>();

function getEntries(displayName: string) {
  return entriesByDisplayName.get(displayName) ?? [];
}

function totalFor(entries: SpendingEntry[]) {
  const cents = entries.reduce((total, entry) => total + Math.round(entry.amount * 100), 0);
  return cents / 100;
}

export function listSpendingEntries(displayName: string) {
  const entries = getEntries(displayName);
  return { entries, total: totalFor(entries) };
}

export function addSpendingEntry(displayName: string, fields: SpendingEntryFields) {
  const entry = { ...fields, id: crypto.randomUUID() };
  const entries = [...getEntries(displayName), entry];
  entriesByDisplayName.set(displayName, entries);
  return { entry, total: totalFor(entries) };
}

export function updateSpendingEntry(
  displayName: string,
  id: string,
  fields: SpendingEntryFields,
) {
  const entries = getEntries(displayName);
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  const entry = { ...fields, id };
  const updatedEntries = entries.map((existing, entryIndex) => (
    entryIndex === index ? entry : existing
  ));
  entriesByDisplayName.set(displayName, updatedEntries);
  return { entry, total: totalFor(updatedEntries) };
}

export function deleteSpendingEntry(displayName: string, id: string) {
  const entries = getEntries(displayName);
  const updatedEntries = entries.filter((entry) => entry.id !== id);
  if (updatedEntries.length === entries.length) return null;

  entriesByDisplayName.set(displayName, updatedEntries);
  return { total: totalFor(updatedEntries) };
}
