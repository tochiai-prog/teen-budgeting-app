import { GET, POST } from "./route";
import { PATCH } from "./[id]/route";

describe("SEC-18 server-side spending entry validation", () => {
  it("a negative amount is rejected by the server", async () => {
    const displayName = `invalid-entry-${Date.now()}-${Math.random()}`;
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowString = tomorrow.toISOString().slice(0, 10);
    const validFields = {
      amount: 12.5,
      date: new Date().toISOString().slice(0, 10),
      category: "Rides",
      merchant: "",
      note: "",
    };
    const invalidEntries = [
      { ...validFields, amount: -1 },
      { ...validFields, amount: 0 },
      { ...validFields, amount: 100_000.01 },
      { ...validFields, amount: "12.5" },
      { ...validFields, date: "2026-02-30" },
      { ...validFields, date: tomorrowString },
      { ...validFields, category: "Custom" },
      { ...validFields, merchant: "m".repeat(201) },
      { ...validFields, note: "n".repeat(201) },
    ];

    for (const fields of invalidEntries) {
      const response = await POST(new Request(
        `http://localhost/api/entries?displayName=${encodeURIComponent(displayName)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        },
      ));

      expect(response.status).toBe(422);
    }

    const response = await GET(new Request(
      `http://localhost/api/entries?displayName=${encodeURIComponent(displayName)}`,
    ));
    expect(await response.json()).toEqual({ entries: [], total: 0 });
  });

  it("the server accepts valid spending entry boundary values", async () => {
    const displayName = `valid-entry-${Date.now()}-${Math.random()}`;
    const date = new Date().toISOString().slice(0, 10);

    for (const amount of [0.01, 100_000]) {
      const response = await POST(new Request(
        `http://localhost/api/entries?displayName=${encodeURIComponent(displayName)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            date,
            category: "Other",
            merchant: "m".repeat(200),
            note: "n".repeat(200),
          }),
        },
      ));

      expect(response.status).toBe(201);
    }
  });

  it("edited spending entries are validated by the server", async () => {
    const displayName = `edited-entry-${Date.now()}-${Math.random()}`;
    const url = `http://localhost/api/entries?displayName=${encodeURIComponent(displayName)}`;
    const createdResponse = await POST(new Request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 12.5,
        date: new Date().toISOString().slice(0, 10),
        category: "Rides",
        merchant: "",
        note: "",
      }),
    }));
    const created = await createdResponse.json() as { entry: { id: string } };

    const response = await PATCH(
      new Request(`http://localhost/api/entries/${created.entry.id}?displayName=${encodeURIComponent(displayName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 12.5,
          date: new Date().toISOString().slice(0, 10),
          category: "Rides",
          merchant: "",
          note: "n".repeat(201),
        }),
      }),
      { params: Promise.resolve({ id: created.entry.id }) },
    );

    expect(response.status).toBe(422);
  });
});
