import { buildPipelineContext } from "@/lib/pipeline";
import { buildProposalPptx } from "@/lib/proposalDeck";

// pptxgenjs / 이미지 생성은 Node 런타임이 필요하다 (Edge 런타임 불가).
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const keyword = typeof body?.keyword === "string" ? body.keyword.trim().slice(0, 100) : "";

  if (!keyword) {
    return Response.json({ error: "keyword is required" }, { status: 400 });
  }

  const ctx = buildPipelineContext(keyword);
  const advertiserName = ctx.recommendedAdvertisers[0] ?? keyword;

  const buffer = await buildProposalPptx(ctx, advertiserName);
  const fileName = `${advertiserName}_광고제안서.pptx`;

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="proposal.pptx"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
