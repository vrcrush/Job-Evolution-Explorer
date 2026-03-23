import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const res = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ status: "REQUEST_FAILED", message: [err.message] }, { status: 500 });
  }
}

// GET handler — proxies BLS flat file lookup (no CORS on server side)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const soc = searchParams.get("soc") || "151252";
    const res = await fetch("https://download.bls.gov/pub/time.series/oe/oe.series");
    const text = await res.text();
    const lines = text.split("\n").filter(l => l.includes(soc)).slice(0, 20);
    return NextResponse.json({ lines });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
