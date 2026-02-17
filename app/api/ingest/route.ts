/* eslint-disable @typescript-eslint/no-explicit-any */
import { chunkFile } from "@/lib/chunker";
import { embedChunks } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const CODE_FILE_REGEX = /\.(ts|js|tsx|jsx|py|go|java|cs)$/i;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const githubUrl = formData.get("githubUrl") as string | null;
    const zipFile = formData.get("zip") as File | null;

    if (!githubUrl && !zipFile) {
      return NextResponse.json(
        { error: "Provide GitHub URL or ZIP file" },
        { status: 400 },
      );
    }

    let owner = "";
    let repo = "";
    let defaultBranch = "zip-upload";
    let validFiles: any[] = [];

    // Github Ingestion
    if (githubUrl) {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

      if (!match) {
        return NextResponse.json(
          { error: "Invalid GitHub URL format" },
          { status: 400 },
        );
      }

      owner = match[1];
      repo = match[2].replace(".git", "");

      const repoRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );

      if (!repoRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch repository info" },
          { status: 400 },
        );
      }

      const repoData = await repoRes.json();
      defaultBranch = repoData.default_branch;

      const { data: existingRepo } = await supabase
        .from("repositories")
        .select("id")
        .eq("owner", owner)
        .eq("name", repo)
        .eq("branch", defaultBranch)
        .maybeSingle();

      if (existingRepo) {
        return NextResponse.json({
          alreadyIndexed: true,
          repoId: existingRepo.id,
          message:
            "This repository has already been processed. You can ask questions directly.",
        });
      }

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      );

      if (!treeRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch repository tree" },
          { status: 400 },
        );
      }

      const treeData = await treeRes.json();

      const codeFiles = treeData.tree.filter(
        (item: any) =>
          item.type === "blob" &&
          CODE_FILE_REGEX.test(item.path) &&
          !item.path.includes("node_modules") &&
          !item.path.includes("dist") &&
          !item.path.includes(".git"),
      );

      const filesWithContent = await Promise.all(
        codeFiles.map(async (file: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;

          const res = await fetch(rawUrl);

          if (!res.ok) {
            return null;
          }

          const content = await res.text();

          return {
            path: file.path,
            size: file.size,
            lines: content.split("\n").length,
            content,
          };
        }),
      );

      // Remove failed fetches
      validFiles = filesWithContent.filter(Boolean);
    }

    // zip ingestion 
    if (zipFile) {
      owner = "local";
      repo = zipFile.name.replace(".zip", "");

      const { data: existingRepo } = await supabase
        .from("repositories")
        .select("id")
        .eq("owner", owner)
        .eq("name", repo)
        .eq("branch", defaultBranch)
        .maybeSingle();

      if (existingRepo) {
        return NextResponse.json({
          alreadyIndexed: true,
          repoId: existingRepo.id,
        });
      }

      const buffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);

      const entries = Object.values(zip.files);

      for (const entry of entries) {
        if (
          !entry.dir &&
          CODE_FILE_REGEX.test(entry.name) &&
          !entry.name.includes("node_modules") &&
          !entry.name.includes("dist")
        ) {
          const content = await entry.async("string");
          validFiles.push({
            path: entry.name,
            content,
          });
        }
      }
    }

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: "No valid code files found." },
        { status: 400 },
      );
    }

    const allChunks: any[] = [];

    for (const file of validFiles) {
      const chunks = chunkFile(file.path, file.content);
      allChunks.push(...chunks);
    }

    const embeddedChunks = await embedChunks(allChunks);

    const repoId = uuidv4();

    const { error: repoError } = await supabase.from("repositories").insert([
      {
        id: repoId,
        owner,
        name: repo,
        branch: defaultBranch,
      },
    ]);

    if (repoError) {
      console.error(repoError);
      return NextResponse.json(
        { error: "Failed to insert repository" },
        { status: 500 },
      );
    }

    const chunkInsertData = embeddedChunks.map((chunk) => ({
      repo_id: repoId,
      file_path: chunk.filePath,
      start_line: chunk.startLine,
      end_line: chunk.endLine,
      type: chunk.type,
      content: chunk.content,
      embedding: chunk.embedding,
    }));

    const { error: chunkError } = await supabase
      .from("code_chunks")
      .insert(chunkInsertData);

    if (chunkError) {
      console.error(chunkError);
      return NextResponse.json(
        { error: "Failed to insert chunks" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      repoId,
      totalChunks: embeddedChunks.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
