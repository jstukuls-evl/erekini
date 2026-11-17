import { NextResponse } from "next/server";

import { searchUrCompanies } from "@/lib/ur/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const result = await searchUrCompanies(q);
  return NextResponse.json(result);
}
