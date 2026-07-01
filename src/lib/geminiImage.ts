const DEFAULT_IMAGE_MODEL = "gemini-2.5-flash-image";
const REQUEST_TIMEOUT_MS = 30000;

// Gemini 이미지 생성 모델을 호출해 base64 PNG를 반환한다.
// 실패(키 미설정, 네트워크 오류, 응답에 이미지 없음) 시 null을 반환하고 호출부에서 대체 배경을 사용한다.
export async function generateAiImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const parts: Array<{ inlineData?: { data?: string } }> = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    return imagePart?.inlineData?.data ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
