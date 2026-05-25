import { NextRequest, NextResponse } from "next/server";
import { listAllMedia } from "@/lib/r2";

export const runtime = "nodejs";
export const revalidate = 300; // 5 min cache

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category  = searchParams.get("category") || "";
  const type      = searchParams.get("type")     || "";
  const q         = searchParams.get("q")        || "";
  const page      = parseInt(searchParams.get("page") || "1", 10);
  const perPage   = parseInt(searchParams.get("perPage") || "60", 10);

  const all = await listAllMedia();

  const filtered = all.filter(f => {
    if (category && f.category !== category) return false;
    if (type && f.type !== type) return false;
    if (q && !f.name.toLowerCase().includes(q.toLowerCase()) &&
             !f.category.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  // Build category counts from full set
  const categories: Record<string, number> = {};
  for (const f of all) {
    categories[f.category] = (categories[f.category] ?? 0) + 1;
  }

  return NextResponse.json({
    items,
    total: filtered.length,
    page,
    perPage,
    pages: Math.ceil(filtered.length / perPage),
    categories,
  });
}
