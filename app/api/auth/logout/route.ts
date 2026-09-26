import { NextResponse } from "next/server";
import { destroySession, isSameOrigin } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  await destroySession();
  return NextResponse.json({ success: true });
}
