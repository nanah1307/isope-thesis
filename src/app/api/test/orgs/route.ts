import { supabase } from "@/app/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("orgs")
    .select("*");

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
