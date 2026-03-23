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
