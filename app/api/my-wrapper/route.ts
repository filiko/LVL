import { NextResponse } from "next/server";

export async function GET() {
  const config = {
        "BACKEND_URL": process.env.BACKEND_URL,
        "DISCORD_CLIENT_ID": process.env.DISCORD_CLIENT_ID,
        "GOOGLE_CLIENT_ID": process.env.GOOGLE_CLIENT_ID
    }
  return NextResponse.json(config);
}