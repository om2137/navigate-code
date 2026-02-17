/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { repoId, question } = await req.json();

    if (!repoId || !question) {
      return NextResponse.json(
        { error: "repoId and question required" },
        { status: 400 },
      );
    }

    // Embed question
    const embeddingResponse = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [question],
    });

    const questionEmbedding = embeddingResponse.embeddings?.[0]?.values;

    if (!questionEmbedding) {
      return NextResponse.json(
        { error: "Failed to embed question" },
        { status: 500 },
      );
    }

    // Vector similarity search
    const { data: chunks, error } = await supabase.rpc("match_code_chunks", {
      query_embedding: questionEmbedding,
      match_repo_id: repoId,
      match_count: 5,
    });

    if (error || !chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "Vector search failed or no matches found" },
        { status: 500 },
      );
    }

    const numberedChunks = chunks.map((chunk: any, index: number) => ({
      chunkId: index + 1,
      filePath: chunk.file_path,
      startLine: chunk.start_line,
      endLine: chunk.end_line,
      content: chunk.content,
    }));

    const context = numberedChunks
      .map(
        (chunk: any) => `
          Chunk ${chunk.chunkId}
          File: ${chunk.filePath}
          Lines: ${chunk.startLine}-${chunk.endLine}

          ${chunk.content}
          `,
      )
      .join("\n\n---\n\n");

    const prompt = `
      You are a code analysis assistant.

      You MUST answer using ONLY the provided chunks.

      IMPORTANT RULES:
      - You may ONLY reference chunks by their chunkId.
      - You MUST NOT invent file paths.
      - You MUST NOT invent line numbers.
      - You MUST NOT reference anything outside the provided chunks.
      - If the answer cannot be found in the chunks, say "Not found in provided context."

      Question:
      ${question}

      Code Chunks:
      ${context}

      Return STRICT JSON in this format:
      {
        "answer": "...",
        "usedChunkIds": [number]
      }
      `;

    // Generate answer
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text?.trim() || "";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const validChunkIds = (parsed.usedChunkIds || []).filter((id: number) =>
      numberedChunks.some((c: any) => c.chunkId === id),
    );

    const references = validChunkIds.map((id: number) => {
      const chunk = numberedChunks.find((c: any) => c.chunkId === id)!;
      return {
        filePath: chunk.filePath,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
      };
    });

    await supabase.from("qa_history").insert([
      {
        repo_id: repoId,
        question,
        answer: parsed.answer,
        answer_references: references,
      },
    ]);

    return NextResponse.json({
      answer: parsed.answer,
      references,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
