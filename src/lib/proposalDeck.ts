import PptxGenJS from "pptxgenjs";
import type { PipelineContext } from "./pipeline";
import { formatPrice, formatRate } from "./adSlots";
import { generateAiImage } from "./geminiImage";

const COLOR = {
  dark: "0B0D14",
  primary: "6D5BFF",
  accent: "22D3C9",
  text: "1F2430",
  muted: "6B7280",
  cardBg: "F5F5FA",
};

const FONT = "Malgun Gothic";

function img(base64: string) {
  return `image/png;base64,${base64}`;
}

// "광고 제안서 - 놀이의발견.pdf" 예시안의 13페이지 구성을 참고해 8슬라이드로 압축한 제안서를 생성한다.
export async function buildProposalPptx(ctx: PipelineContext, advertiserName: string): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "놀이의발견";
  pptx.title = `${advertiserName} 광고 제안서`;

  const [coverImage, personaImage] = await Promise.all([
    generateAiImage(
      "Warm high-resolution lifestyle photo of a happy Korean family with young children playing together outdoors on green grass, joyful dynamic mood, soft warm natural light, professional photography, no text, no logo, no watermark"
    ),
    generateAiImage(
      "Cheerful Korean parent and child looking at a smartphone app together in a bright modern living room, warm natural light, professional lifestyle photography, no text, no logo, no watermark"
    ),
  ]);

  // 1. 표지
  const cover = pptx.addSlide();
  if (coverImage) {
    cover.background = { data: img(coverImage) };
    cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "000000", transparency: 45 }, line: { color: "000000", transparency: 100 } });
  } else {
    cover.background = { color: COLOR.dark };
  }
  cover.addText("놀이의발견 광고 제안서", { x: 0.9, y: 2.7, w: 11.5, h: 1, fontSize: 40, bold: true, color: "FFFFFF", fontFace: FONT });
  cover.addText(`${advertiserName}님을 위한 맞춤 제안`, { x: 0.9, y: 3.7, w: 11.5, h: 0.6, fontSize: 20, color: "FFFFFF", fontFace: FONT });
  cover.addText(`"가족의 행복을 발견하는 여정, ${advertiserName}의 브랜드와 함께 빛나다"`, {
    x: 0.9,
    y: 4.35,
    w: 11.5,
    h: 0.6,
    fontSize: 15,
    italic: true,
    color: "E5E7FF",
    fontFace: FONT,
  });

  // 2. 왜 지금 놀이의발견과 함께여야 할까요
  const intro = pptx.addSlide();
  intro.background = { color: "FFFFFF" };
  intro.addText("왜 지금, 놀이의발견과 함께여야 할까요?", { x: 0.7, y: 0.5, w: 12, h: 0.7, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
  intro.addText(`${ctx.mau}만 회원의 삶에 스며든, 가장 강력한 브랜드 파트너`, {
    x: 0.7,
    y: 1.25,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: COLOR.primary,
    bold: true,
    fontFace: FONT,
  });
  intro.addText(
    `놀이의발견은 단순한 예약 앱을 넘어, 3040 육아 패밀리의 필수 가족 여가 라이프스타일 플랫폼으로 자리매김했습니다. "${ctx.keyword}" 키워드 기준 최근 30일 연관 검색량 증감률은 ${ctx.searchVolumeGrowth}%이며, ${ctx.category} 카테고리는 전년 대비 +${ctx.marketSizeGrowth}% 성장 중입니다. 지금, 가장 활발한 가족 여가 시장의 중심에서 ${advertiserName}의 브랜드 성장 기회를 잡으십시오.`,
    { x: 0.7, y: 1.9, w: 11.9, h: 1.8, fontSize: 14, color: COLOR.muted, fontFace: FONT, lineSpacing: 22 }
  );

  const stats: [string, string][] = [
    ["회원 수", `${ctx.mau}만 명`],
    ["연관 카테고리", ctx.category],
    ["시장 성장률", `+${ctx.marketSizeGrowth}%`],
    ["브랜드 적합도", `${ctx.brandScore}/100`],
  ];
  stats.forEach(([label, value], i) => {
    const x = 0.7 + i * 3;
    intro.addShape(pptx.ShapeType.roundRect, { x, y: 4, w: 2.7, h: 1.6, fill: { color: COLOR.cardBg }, line: { color: COLOR.cardBg }, rectRadius: 0.08 });
    intro.addText(value, { x, y: 4.15, w: 2.7, h: 0.7, align: "center", fontSize: 24, bold: true, color: COLOR.primary, fontFace: FONT });
    intro.addText(label, { x, y: 4.85, w: 2.7, h: 0.5, align: "center", fontSize: 12, color: COLOR.muted, fontFace: FONT });
  });

  // 3. 놀이의발견 소개
  const about = pptx.addSlide();
  about.background = { color: "FFFFFF" };
  about.addText("놀이의발견: 가족의 행복을 큐레이션하다", { x: 0.7, y: 0.5, w: 12, h: 0.7, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
  about.addText("웅진컴퍼스의 혁신적 자회사, 179만 가족 회원이 신뢰하는 통합 여가 플랫폼", {
    x: 0.7,
    y: 1.25,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: COLOR.primary,
    bold: true,
    fontFace: FONT,
  });
  if (personaImage) {
    about.addImage({ data: img(personaImage), x: 8.1, y: 2, w: 4.6, h: 4.6, sizing: { type: "cover", w: 4.6, h: 4.6 } });
  }
  about.addText(
    [
      { text: "회사: ", options: { bold: true } },
      { text: "웅진컴퍼스 자회사\n", options: {} },
      { text: "회원 수: ", options: { bold: true } },
      { text: "179만 부모 회원 보유\n", options: {} },
      { text: "핵심 서비스: ", options: { bold: true } },
      { text: "키즈 놀이, 숙박, 체험 콘텐츠 통합 큐레이션 예약", options: {} },
    ],
    { x: 0.7, y: 2.1, w: 7, h: 1.8, fontSize: 14, color: COLOR.text, fontFace: FONT, lineSpacing: 26 }
  );
  about.addText(
    "차별화된 키즈 놀이, 숙박, 체험 콘텐츠를 통합적으로 큐레이션하여 제공하며, 가족 단위 고객의 모든 여가 활동을 쉽고 편리하게 계획하고 경험할 수 있도록 돕습니다.",
    { x: 0.7, y: 4.1, w: 7, h: 1.5, fontSize: 13, color: COLOR.muted, fontFace: FONT, lineSpacing: 22 }
  );

  // 4. 핵심 타겟 & AI 세그먼트
  const target = pptx.addSlide();
  target.background = { color: "FFFFFF" };
  target.addText("핵심 타겟: AI가 찾은 세그먼트", { x: 0.7, y: 0.5, w: 12, h: 0.7, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
  target.addText(`"${ctx.keyword}" 연관 세그먼트 분석 결과`, { x: 0.7, y: 1.25, w: 12, h: 0.5, fontSize: 16, color: COLOR.primary, bold: true, fontFace: FONT });
  ctx.segments.forEach((seg, i) => {
    const y = 2.1 + i * 1.3;
    target.addShape(pptx.ShapeType.roundRect, { x: 0.7, y, w: 11.9, h: 1.05, fill: { color: COLOR.cardBg }, line: { color: COLOR.cardBg }, rectRadius: 0.06 });
    target.addText(`세그먼트 ${i + 1}`, { x: 1, y: y + 0.12, w: 2, h: 0.4, fontSize: 13, bold: true, color: COLOR.primary, fontFace: FONT });
    target.addText(seg, { x: 1, y: y + 0.5, w: 11.3, h: 0.5, fontSize: 14, color: COLOR.text, fontFace: FONT });
  });

  // 5. 광고 상품 추천 (구좌 테이블)
  const products = pptx.addSlide();
  products.background = { color: "FFFFFF" };
  products.addText("AI 광고 상품 추천", { x: 0.7, y: 0.5, w: 12, h: 0.7, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
  products.addText("사용자 여정 전반의 5개 구좌 중 최적 조합을 AI가 추천합니다", {
    x: 0.7,
    y: 1.25,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: COLOR.primary,
    bold: true,
    fontFace: FONT,
  });
  const tableRows = [
    [
      { text: "구좌", options: { bold: true, fill: { color: COLOR.primary }, color: "FFFFFF" } },
      { text: "위치", options: { bold: true, fill: { color: COLOR.primary }, color: "FFFFFF" } },
      { text: "예상 CTR", options: { bold: true, fill: { color: COLOR.primary }, color: "FFFFFF" } },
      { text: "예상 CVR", options: { bold: true, fill: { color: COLOR.primary }, color: "FFFFFF" } },
      { text: "가격", options: { bold: true, fill: { color: COLOR.primary }, color: "FFFFFF" } },
    ],
    ...ctx.selectedSlots.map((s) => [
      { text: s.name, options: { bold: true } },
      { text: s.location, options: {} },
      { text: formatRate(s.ctrMin, s.ctrMax), options: {} },
      { text: formatRate(s.cvrMin, s.cvrMax), options: {} },
      { text: formatPrice(s), options: {} },
    ]),
  ];
  products.addTable(tableRows, {
    x: 0.7,
    y: 2.1,
    w: 11.9,
    fontSize: 13,
    fontFace: FONT,
    border: { type: "solid", color: "E5E7EB", pt: 1 },
    autoPage: false,
  });
  products.addText(
    ctx.selectedSlots.map((s) => `• ${s.name}: ${s.description}`).join("\n"),
    { x: 0.7, y: 4.6, w: 11.9, h: 2, fontSize: 12, color: COLOR.muted, fontFace: FONT, lineSpacing: 20 }
  );

  // 6. 예상 성과 & ROI
  const roi = pptx.addSlide();
  roi.background = { color: "FFFFFF" };
  roi.addText("예상 성과 & ROI 리포트", { x: 0.7, y: 0.5, w: 12, h: 0.7, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
  roi.addText("데이터로 증명하는 성공, 놀이의발견 광고 효과", { x: 0.7, y: 1.25, w: 12, h: 0.5, fontSize: 16, color: COLOR.primary, bold: true, fontFace: FONT });
  const roiStats: [string, string][] = [
    ["예상 노출", `${ctx.impressions.toLocaleString()}회`],
    ["CTR / CVR", `${ctx.ctr}% / ${ctx.cvr}%`],
    ["월 광고비", `${ctx.monthlySpend.toLocaleString()}원`],
    ["예상 ROAS", `${ctx.roas}%`],
  ];
  roiStats.forEach(([label, value], i) => {
    const x = 0.7 + i * 3;
    roi.addShape(pptx.ShapeType.roundRect, { x, y: 2.2, w: 2.7, h: 1.8, fill: { color: COLOR.cardBg }, line: { color: COLOR.cardBg }, rectRadius: 0.08 });
    roi.addText(value, { x, y: 2.4, w: 2.7, h: 0.9, align: "center", fontSize: 22, bold: true, color: COLOR.primary, fontFace: FONT });
    roi.addText(label, { x, y: 3.3, w: 2.7, h: 0.5, align: "center", fontSize: 12, color: COLOR.muted, fontFace: FONT });
  });
  roi.addText(
    `${ctx.selectedSlots.map((s) => s.name).join(" · ")} 구좌 조합 기준, 광고비 대비 ${
      Number(ctx.roas) >= 250 ? "매우 우수한" : Number(ctx.roas) >= 180 ? "우수한" : "안정적인"
    } 성과가 예상됩니다.`,
    { x: 0.7, y: 4.5, w: 11.9, h: 0.8, fontSize: 14, color: COLOR.text, fontFace: FONT }
  );

  // 7. 재계약 & 업셀링 제안
  const upsell = pptx.addSlide();
  upsell.background = { color: "FFFFFF" };
  upsell.addText("재계약 및 업셀링 제안", { x: 0.7, y: 0.5, w: 12, h: 0.7, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
  upsell.addText(`현재 성과 기준 재계약 추천도: ${Number(ctx.roas) >= 200 ? "높음" : "중간"}`, {
    x: 0.7,
    y: 1.25,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: COLOR.primary,
    bold: true,
    fontFace: FONT,
  });
  upsell.addText(
    ctx.upsellSlot
      ? `${ctx.upsellSlot.name} 구좌(${ctx.upsellSlot.location}, ${formatPrice(ctx.upsellSlot)}) 추가 시 예상 CTR ${formatRate(
          ctx.upsellSlot.ctrMin,
          ctx.upsellSlot.ctrMax
        )}, 예상 CVR ${formatRate(ctx.upsellSlot.cvrMin, ctx.upsellSlot.cvrMax)}의 추가 성과를 기대할 수 있습니다.`
      : "현재 전 구좌를 집행 중입니다. 예산 증액을 통한 노출 확대를 검토해 보세요.",
    { x: 0.7, y: 2.1, w: 11.9, h: 1.2, fontSize: 15, color: COLOR.text, fontFace: FONT, lineSpacing: 24 }
  );

  // 8. 문의 및 CTA
  const cta = pptx.addSlide();
  cta.background = { color: COLOR.dark };
  cta.addText("지금 바로, 놀이의발견과 함께 브랜드 성장을 시작하세요!", {
    x: 0.9,
    y: 2.4,
    w: 11.5,
    h: 1,
    fontSize: 30,
    bold: true,
    color: "FFFFFF",
    fontFace: FONT,
  });
  cta.addText("가족의 행복을, 브랜드의 성공으로 이어드립니다.", { x: 0.9, y: 3.4, w: 11.5, h: 0.6, fontSize: 16, color: COLOR.accent, fontFace: FONT });
  cta.addText(
    [
      { text: "담당자: ", options: { bold: true } },
      { text: "플랫폼통합기획팀\n", options: {} },
      { text: "이메일: ", options: { bold: true } },
      { text: "contact@wjcompass.com\n", options: {} },
    ],
    { x: 0.9, y: 4.3, w: 8, h: 1.2, fontSize: 14, color: "E5E7EB", fontFace: FONT, lineSpacing: 24 }
  );

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}
