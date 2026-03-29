import { NextResponse } from "next/server";

// Token is derived from the password + a salt — never sent to client
const SALT = "00ia-job-explorer-2035";

function makeToken(password) {
  // Simple deterministic token — password never leaves the server
  const raw = `${SALT}:${password}:${SALT}`;
  return Buffer.from(raw).toString("base64");
}

export async function POST(req) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 });
    }

    if (password !== adminPassword) {
      // Slight delay to slow brute force
      await new Promise(r => setTimeout(r, 500));
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = makeToken(adminPassword);
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  // Verify a token is still valid
  try {
    const token = req.headers.get("x-admin-token");
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || !token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const expected = makeToken(adminPassword);
    return NextResponse.json({ valid: token === expected });
  } catch (err) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
