import {
  addSpendingEntry,
  listSpendingEntries,
  type SpendingEntryFields,
} from "@/lib/spendingEntries";

function getDisplayName(request: Request) {
  return new URL(request.url).searchParams.get("displayName")?.trim() ?? "";
}

export async function GET(request: Request) {
  const displayName = getDisplayName(request);
  if (!displayName) {
    return Response.json({ message: "A display name is required." }, { status: 400 });
  }

  return Response.json(listSpendingEntries(displayName));
}

export async function POST(request: Request) {
  const displayName = getDisplayName(request);
  if (!displayName) {
    return Response.json({ message: "A display name is required." }, { status: 400 });
  }

  const fields = await request.json() as SpendingEntryFields;
  return Response.json(addSpendingEntry(displayName, fields), { status: 201 });
}
