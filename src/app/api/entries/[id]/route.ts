import {
  deleteSpendingEntry,
  updateSpendingEntry,
} from "@/lib/spendingEntries";
import { parseSpendingEntryFields } from "@/lib/spendingEntryValidation";

function getDisplayName(request: Request) {
  return new URL(request.url).searchParams.get("displayName")?.trim() ?? "";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const displayName = getDisplayName(request);
  if (!displayName) {
    return Response.json({ message: "A display name is required." }, { status: 400 });
  }

  const { id } = await params;
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

  const result = updateSpendingEntry(displayName, id, fields);
  if (!result) {
    return Response.json({ message: "Entry not found." }, { status: 404 });
  }

  return Response.json(result);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const displayName = getDisplayName(request);
  if (!displayName) {
    return Response.json({ message: "A display name is required." }, { status: 400 });
  }

  const { id } = await params;
  const result = deleteSpendingEntry(displayName, id);
  if (!result) {
    return Response.json({ message: "Entry not found." }, { status: 404 });
  }

  return Response.json(result);
}
