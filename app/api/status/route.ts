import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { GoogleGenAI } from "@google/genai"

export const runtime = "nodejs"

export async function GET() {
  const status = {
    backend: "ok",
    database: "ok",
    llm: "ok",
  }

  //  Database check
  try {
    const { error } = await supabase
      .from("repositories")
      .select("id")
      .limit(1)

    if (error) throw error
  } catch {
    status.database = "down"
  }

  //  LLM check
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: ["health check"],
    })
  } catch {
    status.llm = "down"
  }

  return NextResponse.json(status)
}
