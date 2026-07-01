"use client";

import { useRef, useState } from "react";
import { runPipeline, type PipelineStepResult } from "@/lib/pipeline";

const ENGINE_LABEL: Record<PipelineStepResult["engine"], string> = {
  internal: "내부 데이터",
  "external-ai": "외부 AI (Gemini)",
  final: "AI 업무 자동화",
};

const ENGINE_COLOR: Record<PipelineStepResult["engine"], string> = {
  internal: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "external-ai": "border-violet-500/40 bg-violet-500/10 text-violet-300",
  final: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const EXAMPLES = ["에버랜드", "스타벅스", "무신사", "쿠팡", "겨울 캠핑"];

export default function PipelineDemo() {
  const [keyword, setKeyword] = useState("");
  const [steps, setSteps] = useState<PipelineStepResult[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [usedAi, setUsedAi] = useState(false);
  const [downloadingPpt, setDownloadingPpt] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reveal = (result: PipelineStepResult[]) => {
    setSteps(result);
    setVisibleCount(0);
    setRevealing(true);
    if (timerRef.current) clearInterval(timerRef.current);
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= result.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRevealing(false);
      }
    }, 550);
  };

  const start = async (kw: string) => {
    const target = kw.trim();
    if (!target || loading || revealing) return;

    setLoading(true);
    setUsedAi(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: target }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setUsedAi(Boolean(data.usedAi));
      reveal(data.steps as PipelineStepResult[]);
    } catch {
      // API 호출 실패 시 클라이언트 목업으로 대체
      setUsedAi(false);
      reveal(runPipeline(target));
    } finally {
      setLoading(false);
    }
  };

  const downloadProposal = async () => {
    if (downloadingPpt || !keyword.trim()) return;
    setDownloadingPpt(true);
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${keyword.trim()}_광고제안서.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("제안서 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDownloadingPpt(false);
    }
  };

  const running = loading || revealing;

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(keyword);
        }}
        className="flex flex-col sm:flex-row gap-3 mb-4"
      >
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="브랜드명, 업종, 시즌 키워드를 입력하세요 (예: 에버랜드, 겨울 캠핑)"
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm sm:text-base outline-none focus:border-violet-400/60 placeholder:text-white/35"
        />
        <button
          type="submit"
          disabled={running}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm sm:text-base font-semibold text-black disabled:opacity-50 transition"
        >
          {loading ? "AI 분석 요청 중..." : revealing ? "AI 분석 진행 중..." : "AI 분석 시작"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8 text-xs sm:text-sm">
        <span className="text-white/40 py-1">예시 키워드:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setKeyword(ex);
              start(ex);
            }}
            className="rounded-full border border-white/15 px-3 py-1 text-white/70 hover:border-white/40 hover:text-white transition"
          >
            {ex}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm mb-4">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-violet-400" />
          AI 파이프라인 실행 중...
        </div>
      )}

      {steps.length > 0 && (
        <div className="space-y-3">
          {steps.slice(0, visibleCount).map((step, idx) => (
            <div
              key={step.id}
              className="fade-up rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs font-mono">STEP {idx + 1}</span>
                  <h4 className="font-semibold text-sm sm:text-base">{step.title}</h4>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs ${ENGINE_COLOR[step.engine]}`}
                >
                  {ENGINE_LABEL[step.engine]}
                </span>
              </div>
              <ul className="space-y-1 text-xs sm:text-sm text-white/70 list-disc list-inside">
                {step.lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {step.id === "proposal" && (
                <button
                  onClick={downloadProposal}
                  disabled={downloadingPpt}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs sm:text-sm font-semibold text-black disabled:opacity-50 transition"
                >
                  {downloadingPpt ? "제안서 생성 중... (AI 이미지 포함, 최대 30초 소요)" : "📊 광고 제안서 PPT 다운로드"}
                </button>
              )}
            </div>
          ))}
          {revealing && (
            <div className="flex items-center gap-2 text-white/40 text-xs sm:text-sm pl-1">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-cyan-400" />
              다음 단계 분석 중...
            </div>
          )}
          {!running && visibleCount === steps.length && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              분석 완료 — 담당자 확인 없이 AI가 전 과정을 자동 처리했습니다.{" "}
              {usedAi
                ? "(외부 AI 분석 단계는 Gemini API 실시간 응답입니다)"
                : "(Gemini API 키가 설정되지 않아 목업 데이터로 표시 중입니다)"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
