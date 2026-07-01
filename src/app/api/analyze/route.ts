import { NextResponse } from "next/server";
import {
  buildPipelineContext,
  externalPayloadToSteps,
  generateFinalSteps,
  generateLocalSteps,
  generateMockExternalSteps,
} from "@/lib/pipeline";
import { generateExternalStepsWithGemini, isGeminiConfigured } from "@/lib/gemini";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const keyword = typeof body?.keyword === "string" ? body.keyword.trim().slice(0, 100) : "";

  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const ctx = buildPipelineContext(keyword);
  const local = generateLocalSteps(ctx);
  const final = generateFinalSteps(ctx);

  let external = generateMockExternalSteps(ctx);
  let usedAi = false;

  if (isGeminiConfigured()) {
    try {
      const payload = await generateExternalStepsWithGemini({
        keyword: ctx.keyword,
        category: ctx.category,
        candidates: ctx.candidates,
        segments: ctx.segments,
      });
      external = externalPayloadToSteps(payload);
      usedAi = true;
    } catch (err) {
      console.error("Gemini analysis failed, falling back to mock:", err);
    }
  }

  return NextResponse.json({
    steps: [...local, ...external, ...final],
    usedAi,
  });
}
