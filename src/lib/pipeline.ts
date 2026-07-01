import { CATEGORIES, TOP_RECOMMENDATIONS, findAdvertisersByKeyword } from "./advertisers";
import type { ExternalAiPayload } from "./gemini";

// 키워드 문자열을 시드로 사용하는 결정론적 PRNG (mulberry32).
// 같은 키워드를 입력하면 같은 데모 결과가 나오도록 하여 데모의 신뢰감을 유지한다.
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PipelineStepId =
  | "behavior"
  | "segment"
  | "market"
  | "competitor"
  | "brand"
  | "advertiser"
  | "proposal"
  | "product"
  | "operate"
  | "performance"
  | "roi"
  | "upsell";

export type PipelineStepResult = {
  id: PipelineStepId;
  engine: "internal" | "external-ai" | "final";
  title: string;
  lines: string[];
  tags?: string[];
};

const SEGMENT_PERSONAS = [
  "30대 도심 거주 커플, 주말 근거리 나들이 선호",
  "영유아 동반 가족, 실내 액티비티·안전 시설 중시",
  "MZ 개인 여행객, 인스타그래머블 스팟 탐색형",
  "4050 부모 세대, 가성비·리뷰 신뢰도 중시",
  "반려동물 동반 여행객, 펫프렌들리 시설 선호",
];

const TREND_KEYWORDS = [
  "당일치기", "호캉스", "가성비 패키지", "감성 인테리어", "예약 리드타임 단축",
  "재방문 프로모션", "구독형 멤버십", "지역 소도시 여행", "체험형 액티비티", "친환경 숙소",
];

const AD_PRODUCTS = [
  { name: "홈 배너 노출", desc: "앱/웹 메인 상단 배너, 트래픽 최상위 지면" },
  { name: "네이티브 피드 광고", desc: "탐색 피드 내 콘텐츠형 노출, 클릭 저항감 낮음" },
  { name: "맞춤 추천 슬롯", desc: "AI 세그먼트 매칭 기반 개인화 추천 카드" },
  { name: "푸시 알림 캠페인", desc: "타겟 세그먼트 대상 프로모션 푸시" },
  { name: "키워드 검색 상단 노출", desc: "검색 결과 스폰서드 슬롯" },
  { name: "브랜드 전용 큐레이션관", desc: "광고주 단독 미니 랜딩 페이지" },
];

function pick<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export type PipelineContext = {
  keyword: string;
  category: string;
  candidates: string[];
  recommendedAdvertisers: string[];
  mau: number;
  searchVolumeGrowth: string;
  marketSizeGrowth: string;
  competitorCount: number;
  brandScore: number;
  impressions: number;
  ctr: string;
  cvr: string;
  roas: string;
  upsellBudget: number;
  segments: string[];
  adProducts: string[];
};

// 키워드로부터 파이프라인 전 단계에서 공유할 결정론적 컨텍스트(매칭 광고주, 목업 지표 등)를 생성한다.
export function buildPipelineContext(keyword: string): PipelineContext {
  const seed = hashSeed(keyword || "default");
  const rng = mulberry32(seed);

  const matched = findAdvertisersByKeyword(keyword);
  const matchedNames = Array.from(new Set(matched.map((m) => m.advertiser)));
  const matchedCategories = Array.from(new Set(matched.map((m) => m.category.title)));

  const category = matchedCategories[0] ?? CATEGORIES[Math.floor(rng() * CATEGORIES.length)].title;
  const categoryAdvertisers = CATEGORIES.find((c) => c.title === category)?.advertisers ?? [];

  const candidates = Array.from(new Set([...matchedNames, ...categoryAdvertisers, ...TOP_RECOMMENDATIONS])).slice(
    0,
    30
  );

  const recommendedAdvertisers =
    matchedNames.length > 0 ? matchedNames.slice(0, 5) : pick(rng, TOP_RECOMMENDATIONS, 5);

  return {
    keyword,
    category,
    candidates,
    recommendedAdvertisers,
    mau: 80 + Math.floor(rng() * 400),
    searchVolumeGrowth: (rng() * 40 - 5).toFixed(1),
    marketSizeGrowth: (5 + rng() * 20).toFixed(1),
    competitorCount: 3 + Math.floor(rng() * 6),
    brandScore: 60 + Math.floor(rng() * 35),
    impressions: 50000 + Math.floor(rng() * 400000),
    ctr: (0.8 + rng() * 3.2).toFixed(2),
    cvr: (1.5 + rng() * 6).toFixed(2),
    roas: (150 + rng() * 350).toFixed(0),
    upsellBudget: [500, 800, 1000, 1500, 2000][Math.floor(rng() * 5)],
    segments: pick(rng, SEGMENT_PERSONAS, 2),
    adProducts: pick(rng, AD_PRODUCTS, 3).map((p) => `${p.name} — ${p.desc}`),
  };
}

export function generateLocalSteps(ctx: PipelineContext): PipelineStepResult[] {
  return [
    {
      id: "behavior",
      engine: "internal",
      title: "회원 행동 데이터 분석",
      lines: [
        `"${ctx.keyword}" 관련 검색/클릭 이력 보유 회원 약 ${ctx.mau}만 MAU 중 연관 세그먼트 추출`,
        `최근 30일 연관 검색량 증감률 ${ctx.searchVolumeGrowth}%`,
        `연관 카테고리: ${ctx.category}`,
      ],
      tags: [ctx.category],
    },
    {
      id: "segment",
      engine: "internal",
      title: "AI 고객 세그먼트 생성",
      lines: ctx.segments.map((p, i) => `세그먼트 ${i + 1}: ${p}`),
    },
  ];
}

// Gemini 호출 실패 시(키 미설정, 네트워크 오류 등) 사용하는 목업 대체 결과.
export function generateMockExternalSteps(ctx: PipelineContext): PipelineStepResult[] {
  return [
    {
      id: "market",
      engine: "external-ai",
      title: "AI 시장조사",
      lines: [
        `"${ctx.keyword}" 관련 시장 규모 전년 대비 +${ctx.marketSizeGrowth}% 성장 추정`,
        `주요 트렌드 키워드: ${pick(mulberry32(hashSeed(ctx.keyword)), TREND_KEYWORDS, 4).join(", ")}`,
        `${ctx.category} 카테고리 내 신규 진입 브랜드 증가 추세`,
      ],
    },
    {
      id: "competitor",
      engine: "external-ai",
      title: "AI 경쟁사 분석",
      lines: [
        `동일 카테고리 내 경쟁 브랜드 약 ${ctx.competitorCount}개 식별`,
        `가격/프로모션 경쟁 강도: ${ctx.competitorCount > 6 ? "높음" : ctx.competitorCount > 4 ? "중간" : "낮음"}`,
        `차별화 포인트: 자사 회원 트래픽 기반 정밀 타겟팅 가능`,
      ],
    },
    {
      id: "brand",
      engine: "external-ai",
      title: "AI 브랜드 분석",
      lines: [
        `브랜드 적합도 스코어 ${ctx.brandScore}/100`,
        `추천 매칭 카테고리: ${ctx.category}`,
        ctx.brandScore >= 80 ? "자사 플랫폼 이용자층과의 정합성 매우 높음" : "자사 플랫폼 이용자층과의 정합성 양호",
      ],
    },
    {
      id: "advertiser",
      engine: "external-ai",
      title: "AI 광고주 추천",
      lines: ctx.recommendedAdvertisers.map((name, i) => `추천 ${i + 1}순위: ${name}`),
      tags: ctx.recommendedAdvertisers,
    },
    {
      id: "proposal",
      engine: "external-ai",
      title: "AI 맞춤형 광고 제안서 생성",
      lines: [
        `제안 대상: ${ctx.recommendedAdvertisers[0] ?? "후보 광고주"}`,
        `제안 컨셉: "${ctx.keyword}" 연관 세그먼트 대상 시즌 프로모션 패키지`,
        `기대 효과: 예상 노출 ${ctx.impressions.toLocaleString()}회, 세그먼트 매칭 정밀 타겟팅`,
      ],
    },
  ];
}

// Gemini 응답(payload)을 파이프라인 스텝 형식으로 변환한다.
export function externalPayloadToSteps(payload: ExternalAiPayload): PipelineStepResult[] {
  return [
    { id: "market", engine: "external-ai", title: "AI 시장조사 (Gemini)", lines: payload.market },
    { id: "competitor", engine: "external-ai", title: "AI 경쟁사 분석 (Gemini)", lines: payload.competitor },
    { id: "brand", engine: "external-ai", title: "AI 브랜드 분석 (Gemini)", lines: payload.brand },
    {
      id: "advertiser",
      engine: "external-ai",
      title: "AI 광고주 추천 (Gemini)",
      lines: payload.advertiser.length > 0 ? payload.advertiser : payload.recommended.map((n) => `추천: ${n}`),
      tags: payload.recommended,
    },
    { id: "proposal", engine: "external-ai", title: "AI 맞춤형 광고 제안서 생성 (Gemini)", lines: payload.proposal },
  ];
}

export function generateFinalSteps(ctx: PipelineContext): PipelineStepResult[] {
  return [
    {
      id: "product",
      engine: "final",
      title: "AI 광고 상품 추천",
      lines: ctx.adProducts,
    },
    {
      id: "operate",
      engine: "final",
      title: "광고 운영",
      lines: [
        `캠페인 집행 시작, 총 노출 ${ctx.impressions.toLocaleString()}회 시뮬레이션`,
        `타겟 세그먼트 대상 자동 입찰/노출 최적화 적용`,
      ],
    },
    {
      id: "performance",
      engine: "final",
      title: "광고 효과 분석",
      lines: [
        `CTR ${ctx.ctr}%, CVR ${ctx.cvr}%`,
        `벤치마크 대비 ${Number(ctx.ctr) > 2 ? "상회" : "유사"} 수준`,
      ],
    },
    {
      id: "roi",
      engine: "final",
      title: "ROI 리포트 생성",
      lines: [
        `ROAS ${ctx.roas}%`,
        `광고비 대비 ${Number(ctx.roas) >= 250 ? "매우 우수한" : Number(ctx.roas) >= 180 ? "우수한" : "안정적인"} 성과`,
      ],
    },
    {
      id: "upsell",
      engine: "final",
      title: "AI 재계약 및 업셀링 추천",
      lines: [
        `현재 성과 기준 재계약 추천도: ${Number(ctx.roas) >= 200 ? "높음" : "중간"}`,
        `업셀링 제안: 월 광고 예산 ${ctx.upsellBudget}만원 확대 시 예상 ROAS 추가 상승`,
      ],
    },
  ];
}

// 순수 목업 전체 파이프라인 (API 미설정 시 클라이언트 단독 폴백용).
export function runPipeline(keyword: string): PipelineStepResult[] {
  const ctx = buildPipelineContext(keyword);
  return [...generateLocalSteps(ctx), ...generateMockExternalSteps(ctx), ...generateFinalSteps(ctx)];
}
