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

function buildPrompt(keyword: string, category: string, candidates: string[]): string {
  return `당신은 여가·이커머스 플랫폼 "놀이의발견"의 AI 광고 영업 애널리스트입니다.
아래 키워드를 기준으로 광고주 유치를 위한 5단계 분석을 수행하고, 반드시 JSON으로만 답하세요.

키워드: "${keyword}"
연관 카테고리: ${category}
광고주 후보 목록 (advertiser, recommended 항목은 반드시 이 목록 중에서만 선택): ${candidates.join(", ")}

다음 JSON 스키마를 정확히 따르세요 (각 배열은 한국어 문장 2~4개, 불필요한 설명 금지):
{
  "market": string[],       // 시장조사: 시장 규모, 성장률, 트렌드
  "competitor": string[],   // 경쟁사 분석: 경쟁 강도, 주요 경쟁사 특징
  "brand": string[],        // 브랜드 분석: 브랜드 적합도, 자사 플랫폼과의 정합성
  "advertiser": string[],   // 광고주 추천 근거 설명
  "recommended": string[],  // 추천 광고주 이름 3~5개 (반드시 후보 목록 중에서 선택)
  "proposal": string[]      // 맞춤형 광고 제안서 핵심 내용
}`;
}

export async function generateExternalStepsWithGemini(params: {
  keyword: string;
  category: string;
  candidates: string[];
}): Promise<ExternalAiPayload> {
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
          contents: [{ role: "user", parts: [{ text: buildPrompt(params.keyword, params.category, params.candidates) }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Failed to parse Gemini API response as JSON");
  }

  const p = parsed as Partial<ExternalAiPayload>;
  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const recommended = toStringArray(p.recommended).filter((name) => params.candidates.includes(name));

  return {
    market: toStringArray(p.market),
    competitor: toStringArray(p.competitor),
    brand: toStringArray(p.brand),
    advertiser: toStringArray(p.advertiser),
    recommended: recommended.length > 0 ? recommended : params.candidates.slice(0, 5),
    proposal: toStringArray(p.proposal),
  };
}
