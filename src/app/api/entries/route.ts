import {
  addSpendingEntry,
  listSpendingEntries,
} from "@/lib/spendingEntries";
import { parseSpendingEntryFields } from "@/lib/spendingEntryValidation";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ message: "The request body must be valid JSON." }, { status: 400 });
    }
    throw error;
  }

  const fields = parseSpendingEntryFields(body);
  if (!fields) {
    return Response.json({ message: "Invalid spending entry." }, { status: 422 });
  }

  return Response.json(addSpendingEntry(displayName, fields), { status: 201 });
}
