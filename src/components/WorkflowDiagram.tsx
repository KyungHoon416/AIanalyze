type Flow = {
  label: string;
  color: string;
  steps: string[];
};

const FLOWS: Flow[] = [
  {
    label: "내부 AI 업무 흐름 (전체)",
    color: "border-sky-500/30 bg-sky-500/[0.06]",
    steps: [
      "회원 행동 데이터 분석",
      "AI 고객 세그먼트 생성",
      "AI 시장조사",
      "AI 경쟁사 분석",
      "AI 광고주 추천",
      "AI 맞춤형 광고 제안서 생성",
      "AI 광고 상품 추천",
      "광고 운영",
      "광고 효과 분석",
      "ROI 리포트 생성",
      "AI 재계약 및 업셀링 추천",
    ],
  },
  {
    label: "외부 AI 분석 (GPT / Gemini)",
    color: "border-violet-500/30 bg-violet-500/[0.06]",
    steps: ["시장조사", "경쟁사 분석", "브랜드 분석", "광고주 추천", "광고 제안서 생성"],
  },
  {
    label: "최종 AI 업무",
    color: "border-emerald-500/30 bg-emerald-500/[0.06]",
    steps: ["광고 상품 추천", "광고 운영", "광고 효과 분석", "ROI 리포트 생성", "재계약 및 업셀링 추천"],
  },
];

export default function WorkflowDiagram() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {FLOWS.map((flow) => (
        <div key={flow.label} className={`rounded-2xl border p-5 ${flow.color}`}>
          <h3 className="font-semibold mb-4 text-sm sm:text-base">{flow.label}</h3>
          <ol className="space-y-2">
            {flow.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-mono">
                  {i + 1}
                </span>
                <span className="text-white/80">{step}</span>
                {i < flow.steps.length - 1 && (
                  <span className="ml-auto text-white/20 hidden sm:inline">↓</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
