import { addSpendingEntry, listSpendingEntries } from "./spendingEntries";

describe("in-memory spending entry ownership", () => {
  it("shows the same entries to anyone using the same display name", () => {
    const displayName = `shared-name-${Date.now()}-${Math.random()}`;
    const fields = {
      amount: 10.1,
      date: "2026-10-17",
      category: "Rides",
      merchant: "",
      note: "",
    };

    addSpendingEntry(displayName, fields);
    addSpendingEntry(displayName, { ...fields, amount: 0.2 });

    expect(listSpendingEntries(displayName).total).toBe(10.3);
    expect(listSpendingEntries(displayName).entries).toHaveLength(2);
    expect(listSpendingEntries(`${displayName} other`).entries).toEqual([]);
  });
});
