type Chunk = {
  filePath: string
  startLine: number
  endLine: number
  type: string
  content: string
}

const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  js: [
    /function\s+([a-zA-Z0-9_]+)/g,
    /export\s+function\s+([a-zA-Z0-9_]+)/g,
    /const\s+([a-zA-Z0-9_]+)\s*=\s*\(/g,
    /([a-zA-Z0-9_]+)\s*=\s*async\s*\(/g
  ],
  ts: [
    /function\s+([a-zA-Z0-9_]+)/g,
    /export\s+async\s+function\s+([a-zA-Z0-9_]+)/g,
    /export\s+function\s+([a-zA-Z0-9_]+)/g
  ],
  py: [
    /def\s+([a-zA-Z0-9_]+)\s*\(/g
  ],
  java: [
    /(public|private|protected)\s+[a-zA-Z0-9_<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g
  ],
  cs: [
    /(public|private|protected)\s+[a-zA-Z0-9_<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g
  ],
  go: [
    /func\s+([a-zA-Z0-9_]+)/g
  ]
}

const CLASS_PATTERNS: Record<string, RegExp[]> = {
  js: [/class\s+([a-zA-Z0-9_]+)/g],
  ts: [/class\s+([a-zA-Z0-9_]+)/g],
  py: [/class\s+([a-zA-Z0-9_]+)/g],
  java: [/class\s+([a-zA-Z0-9_]+)/g],
  cs: [/class\s+([a-zA-Z0-9_]+)/g],
  go: []
}

function detectExt(filePath: string) {
  return filePath.split(".").pop()?.toLowerCase() || ""
}

function getLineNumber(content: string, index: number) {
  return content.slice(0, index).split("\n").length
}

function extractBlocks(
  filePath: string,
  content: string,
  patterns: RegExp[],
  type: string
): Chunk[] {
  const chunks: Chunk[] = []

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const startIndex = match.index
      const startLine = getLineNumber(content, startIndex)

      const block = extractBraceBlock(content, startIndex)

      if (!block) continue

      chunks.push({
        filePath,
        startLine,
        endLine: startLine + block.lines - 1,
        type,
        content: block.text
      })
    }
  }

  return chunks
}

function extractBraceBlock(content: string, startIndex: number) {
  let openBraces = 0
  let started = false
  let endIndex = startIndex

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i]

    if (char === "{") {
      openBraces++
      started = true
    }

    if (char === "}") {
      openBraces--
    }

    if (started && openBraces === 0) {
      endIndex = i + 1
      break
    }
  }

  if (!started) return null

  const text = content.slice(startIndex, endIndex)
  const lines = text.split("\n").length

  return { text, lines }
}

function fallbackChunking(
  filePath: string,
  content: string,
  chunkSize = 800,
  overlap = 150
): Chunk[] {
  const lines = content.split("\n")
  const chunks: Chunk[] = []

  let start = 0

  while (start < lines.length) {
    const end = Math.min(start + chunkSize, lines.length)

    chunks.push({
      filePath,
      startLine: start + 1,
      endLine: end,
      type: "fallback",
      content: lines.slice(start, end).join("\n")
    })

    start += chunkSize - overlap
  }

  return chunks
}

export function chunkFile(filePath: string, content: string): Chunk[] {
  const ext = detectExt(filePath)

  const chunks: Chunk[] = []

  chunks.push({
    filePath,
    startLine: 1,
    endLine: content.split("\n").length,
    type: "file",
    content
  })

  const functionChunks = extractBlocks(
    filePath,
    content,
    FUNCTION_PATTERNS[ext] || [],
    "function"
  )

  const classChunks = extractBlocks(
    filePath,
    content,
    CLASS_PATTERNS[ext] || [],
    "class"
  )

  chunks.push(...classChunks)
  chunks.push(...functionChunks)

  if (chunks.length === 1) {
    return fallbackChunking(filePath, content)
  }

  return chunks
}
