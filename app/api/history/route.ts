import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const repoId = searchParams.get("repoId")

    if (!repoId) {
      return NextResponse.json(
        { error: "repoId is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("qa_history")
      .select("question, answer, answer_references, created_at")
      .eq("repo_id", repoId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      history: data || []
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
