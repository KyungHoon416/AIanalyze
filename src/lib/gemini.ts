const DEFAULT_MODEL = "gemini-2.5-flash";
// 프롬프트가 TAM/SAM/SOM, 경쟁사 벤치마크 등 상세한 출력을 요구하면서 생성 시간이 늘어나
// 20초로는 종종 중간에 잘리는 문제가 있어 45초로 늘림.
const REQUEST_TIMEOUT_MS = 45000;

export type ExternalAiPayload = {
  market: string[];
  competitor: string[];
  brand: string[];
  advertiser: string[];
  recommended: string[];
  proposal: string[];
};

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function callGeminiJson(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        }),
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API returned an empty response");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Failed to parse Gemini API response as JSON");
  }
}

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

const PERSONA = `당신은 웅진컴퍼스 플랫폼사업기획팀 소속 기획자이며, 10년 이상의 플랫폼 전략·서비스 기획 경험과
B2B/B2C 통합 플랫폼 운영 경험을 보유하고 있습니다. 담당 플랫폼은 랠리즈(Rallies), 놀발(놀이의발견),
클래스박스(ClassBox)/클래스몰(ClassMall), 리딩오션스 플러스(Reading Oceans Plus)입니다.
당신은 전략 기획, 시장 분석, 서비스 정책 설계, 데이터 분석, 보고서 작성까지 전방위 업무를 수행하며,
모든 산출물은 추상적 미사여구 없이 구체적 수치와 근거를 담아 실무자가 바로 의사결정에 쓸 수 있어야 합니다.`;

// --- 1단계: AI 시장조사 (첫 프롬프트, 이전 단계 없음) ---
async function analyzeMarket(keyword: string, category: string, segments: string[]): Promise<string[]> {
  const prompt = `${PERSONA}
다음 키워드에 대한 시장조사를 수행하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
타겟 세그먼트: ${segments.join(" / ")}

아래 항목을 모두 포함해 시장 분석을 작성하세요.
1. 시장 규모: TAM(전체 잠재 시장)·SAM(서비스 제공 가능 시장)·SOM(놀이의발견이 실제 타겟 가능한 시장) 각각을 구체적 수치나 추정 근거와 함께 제시.
2. 최근 성장률과 그 배경, 세부 트렌드 3가지 이상.
3. 타겟 세그먼트별 소비 행태(구매 결정 요인, 채널 선호).

JSON 스키마: { "lines": string[] } — 근거와 수치를 담은 한국어 문장 7~10개 (TAM/SAM/SOM은 각각 최소 1개 문장으로 명시). 각 문장은 구체적이고 실무적으로 작성하세요.`;
  const parsed = (await callGeminiJson(prompt)) as { lines?: unknown };
  return toStringArray(parsed.lines);
}

// --- 2단계: AI 경쟁사 분석 (1단계 시장조사 결과를 입력으로 사용) ---
async function analyzeCompetitors(keyword: string, category: string, marketLines: string[]): Promise<string[]> {
  const prompt = `${PERSONA}
아래는 방금 수행한 시장조사 결과입니다. 이 결과를 근거로 경쟁사 벤치마크 분석을 수행하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
시장조사 결과:
${marketLines.map((l) => `- ${l}`).join("\n")}

실존하는 주요 경쟁 브랜드를 구체적으로 3곳 이상 거명해, 각 경쟁사별로 다음을 비교하세요: 기능/상품 구성, 가격·프로모션 정책, 구독/결제 구조, 추정 시장 점유율 또는 규모, 강점과 약점.
마지막에 위 벤치마크를 근거로 자사(놀이의발견) 대비 차별화 포인트를 종합하세요.
JSON 스키마: { "lines": string[] } — 위 시장조사 결과를 반영한 한국어 문장 7~10개 (경쟁사별 최소 1개 문장 포함).`;
  const parsed = (await callGeminiJson(prompt)) as { lines?: unknown };
  return toStringArray(parsed.lines);
}

// --- 3단계: AI 브랜드 분석 (시장조사 + 경쟁사 분석 결과를 입력으로 사용) ---
async function analyzeBrand(
  keyword: string,
  category: string,
  marketLines: string[],
  competitorLines: string[]
): Promise<string[]> {
  const prompt = `${PERSONA}
아래는 앞서 수행한 시장조사와 경쟁사 분석 결과입니다. 이를 근거로 "${keyword}"가 놀이의발견 플랫폼과 얼마나 잘 맞는지 브랜드 적합도를 심층 분석하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
시장조사 결과:
${marketLines.map((l) => `- ${l}`).join("\n")}
경쟁사 분석 결과:
${competitorLines.map((l) => `- ${l}`).join("\n")}

브랜드 적합도 점수(정성적 근거 포함), 자사 회원 데이터와의 정합성, 잠재 리스크 요인, 협업 시 기대 시너지를 구체적으로 다루세요.
JSON 스키마: { "lines": string[] } — 한국어 문장 5~7개.`;
  const parsed = (await callGeminiJson(prompt)) as { lines?: unknown };
  return toStringArray(parsed.lines);
}

// --- 4단계: AI 광고주 추천 (시장조사 + 경쟁사 분석 결과를 근거로, 후보 목록 중에서만 선택) ---
async function recommendAdvertisers(
  keyword: string,
  category: string,
  candidates: string[],
  marketLines: string[],
  competitorLines: string[]
): Promise<{ lines: string[]; recommended: string[] }> {
  const prompt = `${PERSONA}
아래는 앞서 수행한 시장조사와 경쟁사 분석 결과입니다. 이 두 결과를 근거로, 반드시 아래 광고주 후보 목록 중에서만 광고주를 추천하세요. 목록에 없는 브랜드는 절대 추천하지 마세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
시장조사 결과:
${marketLines.map((l) => `- ${l}`).join("\n")}
경쟁사 분석 결과:
${competitorLines.map((l) => `- ${l}`).join("\n")}
광고주 후보 목록 (이 중에서만 선택): ${candidates.join(", ")}

추천 광고주별로 왜 지금 이 키워드/시장 상황에 적합한지 구체적 근거를 각각 제시하세요.
JSON 스키마: { "lines": string[], "recommended": string[] } — lines는 추천 근거 설명 5~8개(가능하면 광고주별로 1개 이상), recommended는 후보 목록 중에서 고른 광고주 이름 3~5개.`;
  const parsed = (await callGeminiJson(prompt)) as { lines?: unknown; recommended?: unknown };
  const recommended = toStringArray(parsed.recommended).filter((name) => candidates.includes(name));
  return { lines: toStringArray(parsed.lines), recommended };
}

// --- 5단계: AI 맞춤형 광고 제안서 생성 (위 전 단계 결과 + 추천 광고주를 근거로) ---
async function draftProposal(
  keyword: string,
  recommendedAdvertiser: string,
  marketLines: string[],
  competitorLines: string[],
  brandLines: string[]
): Promise<string[]> {
  const prompt = `${PERSONA}
아래는 앞서 수행한 시장조사, 경쟁사 분석, 브랜드 분석 결과입니다. 이를 종합해 "${recommendedAdvertiser}"를 위한 맞춤형 광고 제안 컨셉을 작성하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
제안 대상 광고주: ${recommendedAdvertiser}
시장조사 결과:
${marketLines.map((l) => `- ${l}`).join("\n")}
경쟁사 분석 결과:
${competitorLines.map((l) => `- ${l}`).join("\n")}
브랜드 분석 결과:
${brandLines.map((l) => `- ${l}`).join("\n")}

제안 컨셉, 추천 캠페인 방향(시즌/테마), 기대 효과(정성+정량), 실행 시 유의사항을 포함해 구체적으로 작성하세요.
JSON 스키마: { "lines": string[] } — 한국어 문장 5~7개.`;
  const parsed = (await callGeminiJson(prompt)) as { lines?: unknown };
  return toStringArray(parsed.lines);
}

// 시장조사 → 경쟁사 분석 → 브랜드 분석 → 광고주 추천 → 제안서 생성 순으로, 각 단계가 이전 단계의
// 결과를 입력받아 실행되는 순차 체이닝 파이프라인. (병렬 단일 호출이 아님)
export async function generateExternalStepsWithGemini(params: {
  keyword: string;
  category: string;
  candidates: string[];
  segments: string[];
}): Promise<ExternalAiPayload> {
  const market = await analyzeMarket(params.keyword, params.category, params.segments);
  const competitor = await analyzeCompetitors(params.keyword, params.category, market);
  const brand = await analyzeBrand(params.keyword, params.category, market, competitor);
  const { lines: advertiser, recommended: recommendedRaw } = await recommendAdvertisers(
    params.keyword,
    params.category,
    params.candidates,
    market,
    competitor
  );
  const recommended = recommendedRaw.length > 0 ? recommendedRaw : params.candidates.slice(0, 5);
  const proposal = await draftProposal(params.keyword, recommended[0] ?? params.keyword, market, competitor, brand);

  return { market, competitor, brand, advertiser, recommended, proposal };
}
