import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";
import type { PipelineContext } from "./pipeline";
import { formatPrice, formatRate, monthlyListPrice, monthlyPromoPrice } from "./adSlots";
import { fixPptxContentTypes } from "./pptxFix";

const COLOR = {
  dark: "0B0D14",
  primary: "6D5BFF",
  accent: "22D3C9",
  text: "1F2430",
  muted: "6B7280",
  cardBg: "F5F5FA",
};

const FONT = "Malgun Gothic";

// 실제 "놀이의발견 광고 마케팅 제안서" 자료(public/proposal)의 고정 브랜드 슬라이드.
// AI로 재현하지 않고 원본 이미지를 그대로 사용해 실제 앱 화면/조직도/후기와의 괴리를 없앤다.
const INTRO_SLIDE_IMAGES = [
  "proposal/01-cover.jpg",
  "proposal/02-history.jpg",
  "proposal/03-introduce.jpg",
  "proposal/04-intro.jpg",
  "proposal/05-reviews.jpg",
];
const CLOSING_SLIDE_IMAGE = "proposal/99-closing.jpg";

function readImageDataUri(relPath: string): string {
  const filePath = path.join(process.cwd(), "public", relPath);
  const buffer = fs.readFileSync(filePath);
  return `image/jpeg;base64,${buffer.toString("base64")}`;
}

// slide.background에 서로 다른 이미지를 여러 장 연속으로 지정하면 pptxgenjs(4.0.1)가
// 슬라이드마다 별도의 slideMaster를 선언해버리면서 실제로는 그 파일들을 쓰지 않는
// 손상된 패키지를 생성하는 버그가 있다 (Content_Types.xml에 없는 파트가 참조됨).
// background 대신 전체 슬라이드를 덮는 일반 이미지 오브젝트로 추가해 이를 피한다.
function addFullBleedImageSlide(pptx: PptxGenJS, relPath: string) {
  const slide = pptx.addSlide();
  slide.addImage({ data: readImageDataUri(relPath), x: 0, y: 0, w: "100%", h: "100%" });
}

function addStatCards(slide: PptxGenJS.Slide, stats: [string, string][], y: number) {
  const w = 11.9 / stats.length;
  stats.forEach(([label, value], i) => {
    const x = 0.7 + i * w;
    slide.addShape("roundRect", { x, y, w: w - 0.2, h: 1.6, fill: { color: COLOR.cardBg }, line: { color: COLOR.cardBg }, rectRadius: 0.08 });
    slide.addText(value, { x, y: y + 0.15, w: w - 0.2, h: 0.7, align: "center", fontSize: 20, bold: true, color: COLOR.primary, fontFace: FONT });
    slide.addText(label, { x, y: y + 0.85, w: w - 0.2, h: 0.5, align: "center", fontSize: 11, color: COLOR.muted, fontFace: FONT });
  });
}

function addSlideHeader(slide: PptxGenJS.Slide, eyebrow: string, title: string) {
  slide.addText(eyebrow, { x: 0.7, y: 0.45, w: 12, h: 0.4, fontSize: 13, bold: true, color: COLOR.primary, fontFace: FONT });
  slide.addText(title, { x: 0.7, y: 0.8, w: 12, h: 0.8, fontSize: 26, bold: true, color: COLOR.text, fontFace: FONT });
}

// "놀이의발견 광고 마케팅 제안서" 실제 자료의 5개 고정 브랜드 슬라이드 + 키워드별 AI 동적 슬라이드로 구성된 제안서를 생성한다.
export async function buildProposalPptx(ctx: PipelineContext, advertiserName: string): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "놀이의발견";
  pptx.title = `${advertiserName} 광고 제안서`;

  // 1~5: 표지 / History / Introduce / 소개 / 후기 (고정 브랜드 슬라이드)
  INTRO_SLIDE_IMAGES.forEach((relPath) => addFullBleedImageSlide(pptx, relPath));

  // 6. AI 광고 상품 추천
  const products = pptx.addSlide();
  products.background = { color: "FFFFFF" };
  addSlideHeader(products, "AD PRODUCTS", "AI 광고 상품 추천");
  products.addText(`"${ctx.keyword}" 분석 결과, ${advertiserName}에 최적화된 구좌 조합을 추천합니다`, {
    x: 0.7,
    y: 1.55,
    w: 12,
    h: 0.5,
    fontSize: 14,
    color: COLOR.muted,
    fontFace: FONT,
  });
  const headerRow = ["구좌", "위치", "정가", "프로모션가", "전환율"].map((t) => ({
    text: t,
    options: { bold: true, fill: { color: COLOR.primary }, color: "FFFFFF" },
  }));
  const bodyRows = ctx.selectedSlots.map((s) => [
    { text: s.name, options: { bold: true } },
    { text: s.location, options: {} },
    { text: formatPrice(monthlyListPrice(s), "월"), options: {} },
    { text: formatPrice(monthlyPromoPrice(s), "월"), options: { color: COLOR.primary, bold: true } },
    { text: formatRate(s.conversionMin, s.conversionMax), options: {} },
  ]);
  products.addTable([headerRow, ...bodyRows], {
    x: 0.7,
    y: 2.2,
    w: 11.9,
    fontSize: 13,
    fontFace: FONT,
    border: { type: "solid", color: "E5E7EB", pt: 1 },
    autoPage: false,
  });
  products.addText(
    ctx.selectedSlots.map((s) => `• ${s.name}: ${s.description}`).join("\n"),
    { x: 0.7, y: 4.5, w: 11.9, h: 2, fontSize: 12, color: COLOR.muted, fontFace: FONT, lineSpacing: 20 }
  );

  // 7. 광고 운영
  const operate = pptx.addSlide();
  operate.background = { color: "FFFFFF" };
  addSlideHeader(operate, "CAMPAIGN", "광고 운영");
  operate.addText(`${ctx.selectedSlots.map((s) => s.name).join(" + ")} 구좌 조합으로 캠페인을 집행합니다`, {
    x: 0.7,
    y: 1.55,
    w: 12,
    h: 0.5,
    fontSize: 14,
    color: COLOR.muted,
    fontFace: FONT,
  });
  const discount = ctx.monthlyListSpend > 0 ? Math.round((1 - ctx.monthlySpend / ctx.monthlyListSpend) * 100) : 0;
  addStatCards(
    operate,
    [
      ["예상 노출", `${ctx.impressions.toLocaleString()}회`],
      ["정가 기준 월 광고비", `${ctx.monthlyListSpend.toLocaleString()}원`],
      ["프로모션 월 광고비", `${ctx.monthlySpend.toLocaleString()}원`],
      ["정가 대비 할인율", `${discount}%`],
    ],
    2.3
  );
  operate.addText(
    `${ctx.mau}만 MAU 회원 데이터를 기반으로 "${ctx.keyword}" 연관 세그먼트에 자동 입찰/노출 최적화가 적용됩니다.`,
    { x: 0.7, y: 4.4, w: 11.9, h: 0.8, fontSize: 14, color: COLOR.text, fontFace: FONT }
  );

  // 8. 광고 효과 분석
  const performance = pptx.addSlide();
  performance.background = { color: "FFFFFF" };
  addSlideHeader(performance, "PERFORMANCE", "광고 효과 분석");
  addStatCards(
    performance,
    [
      ["예상 노출", `${ctx.impressions.toLocaleString()}회`],
      ["평균 전환율", `${ctx.conversionRate}%`],
      ["예상 전환 수", `${ctx.conversions.toLocaleString()}건`],
      ["예상 매출", `${ctx.revenue.toLocaleString()}원`],
    ],
    2.2
  );
  performance.addChart(
    "bar",
    [
      {
        name: "전환율(%)",
        labels: ctx.selectedSlots.map((s) => s.name),
        values: ctx.selectedSlots.map((s) => Number(((s.conversionMin + s.conversionMax) / 2).toFixed(1))),
      },
    ],
    {
      x: 0.7,
      y: 4.2,
      w: 11.9,
      h: 2.6,
      showValue: true,
      chartColors: [COLOR.primary],
      catAxisLabelColor: COLOR.muted,
      valAxisLabelColor: COLOR.muted,
      title: "구좌별 예상 전환율",
      showTitle: true,
      titleColor: COLOR.text,
    }
  );

  // 9. ROI 리포트
  const roi = pptx.addSlide();
  roi.background = { color: "FFFFFF" };
  addSlideHeader(roi, "ROI REPORT", "ROI 리포트");
  addStatCards(
    roi,
    [
      ["월 광고비", `${ctx.monthlySpend.toLocaleString()}원`],
      ["예상 매출", `${ctx.revenue.toLocaleString()}원`],
      ["예상 ROAS", `${ctx.roas}%`],
      ["브랜드 적합도", `${ctx.brandScore}/100`],
    ],
    2.2
  );
  roi.addChart(
    "line",
    [
      {
        name: "누적 예상 매출(만원)",
        labels: ["1주", "2주", "3주", "4주"],
        values: [1, 2, 3, 4].map((w) => Math.round((ctx.revenue / 10000 / 4) * w)),
      },
    ],
    {
      x: 0.7,
      y: 4.2,
      w: 11.9,
      h: 2.6,
      lineDataSymbol: "circle",
      chartColors: [COLOR.accent],
      catAxisLabelColor: COLOR.muted,
      valAxisLabelColor: COLOR.muted,
      title: "캠페인 기간 중 예상 누적 매출 추이",
      showTitle: true,
      titleColor: COLOR.text,
    }
  );

  // 10. 재계약 및 업셀링 추천
  const upsell = pptx.addSlide();
  upsell.background = { color: "FFFFFF" };
  addSlideHeader(upsell, "RENEWAL & UPSELL", "재계약 및 업셀링 추천");
  upsell.addText(`현재 성과 기준 재계약 추천도: ${Number(ctx.roas) >= 200 ? "높음" : "중간"}`, {
    x: 0.7,
    y: 1.6,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: COLOR.primary,
    bold: true,
    fontFace: FONT,
  });
  upsell.addText(
    ctx.upsellSlot
      ? `${ctx.upsellSlot.name} 구좌(${ctx.upsellSlot.location}, 프로모션가 ${formatPrice(
          monthlyPromoPrice(ctx.upsellSlot),
          "월"
        )}) 추가 시 예상 전환율 ${formatRate(
          ctx.upsellSlot.conversionMin,
          ctx.upsellSlot.conversionMax
        )}의 추가 성과를 기대할 수 있습니다.`
      : "현재 전 구좌를 집행 중입니다. 예산 증액을 통한 노출 확대를 검토해 보세요.",
    { x: 0.7, y: 2.3, w: 11.9, h: 1.2, fontSize: 15, color: COLOR.text, fontFace: FONT, lineSpacing: 24 }
  );

  // 11. 감사합니다 (고정 클로징 슬라이드, 실제 연락처 포함)
  addFullBleedImageSlide(pptx, CLOSING_SLIDE_IMAGE);

  const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return fixPptxContentTypes(buffer);
}
