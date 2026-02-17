import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

type Chunk = {
  filePath: string
  startLine: number
  endLine: number
  type: string
  content: string
}

function formatChunkForEmbedding(chunk: Chunk): string {
  return `
File: ${chunk.filePath}
Type: ${chunk.type}
Lines: ${chunk.startLine}-${chunk.endLine}

${chunk.content}
`.trim()
}

export async function embedChunks(chunks: Chunk[]) {
  const texts = chunks.map(formatChunkForEmbedding)

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: texts
  })

  const embeddings = response.embeddings;

  if (!embeddings || embeddings.length !== chunks.length) {
    throw new Error("Embedding count mismatch")
  }

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index].values
  }))
}
