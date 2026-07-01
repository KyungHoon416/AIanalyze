const DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 20000;

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

const PERSONA = `당신은 여가·이커머스 플랫폼 "놀이의발견"의 AI 광고 영업 애널리스트입니다.`;

// --- 1단계: AI 시장조사 (첫 프롬프트, 이전 단계 없음) ---
async function analyzeMarket(keyword: string, category: string, segments: string[]): Promise<string[]> {
  const prompt = `${PERSONA}
다음 키워드에 대한 시장조사를 수행하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
타겟 세그먼트: ${segments.join(" / ")}

JSON 스키마: { "lines": string[] } — 시장 규모, 성장률, 트렌드를 담은 한국어 문장 2~4개.`;
  const parsed = (await callGeminiJson(prompt)) as { lines?: unknown };
  return toStringArray(parsed.lines);
}

// --- 2단계: AI 경쟁사 분석 (1단계 시장조사 결과를 입력으로 사용) ---
async function analyzeCompetitors(keyword: string, category: string, marketLines: string[]): Promise<string[]> {
  const prompt = `${PERSONA}
아래는 방금 수행한 시장조사 결과입니다. 이 결과를 근거로 경쟁사 분석을 수행하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
시장조사 결과:
${marketLines.map((l) => `- ${l}`).join("\n")}

JSON 스키마: { "lines": string[] } — 위 시장조사 결과를 반영한 경쟁 강도, 주요 경쟁사 특징을 담은 한국어 문장 2~4개.`;
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
아래는 앞서 수행한 시장조사와 경쟁사 분석 결과입니다. 이를 근거로 "${keyword}"가 놀이의발견 플랫폼과 얼마나 잘 맞는지 브랜드 적합도를 분석하세요. 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
시장조사 결과:
${marketLines.map((l) => `- ${l}`).join("\n")}
경쟁사 분석 결과:
${competitorLines.map((l) => `- ${l}`).join("\n")}

JSON 스키마: { "lines": string[] } — 브랜드 적합도, 자사 플랫폼 이용자층과의 정합성을 담은 한국어 문장 2~3개.`;
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

JSON 스키마: { "lines": string[], "recommended": string[] } — lines는 추천 근거 설명 2~4개, recommended는 후보 목록 중에서 고른 광고주 이름 3~5개.`;
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

JSON 스키마: { "lines": string[] } — 제안 컨셉, 기대 효과를 담은 한국어 문장 2~4개.`;
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
