import PipelineDemo from "@/components/PipelineDemo";
import WorkflowDiagram from "@/components/WorkflowDiagram";
import CategoryBrowser from "@/components/CategoryBrowser";
import TopRecommendations from "@/components/TopRecommendations";

const AI_SCOPE = [
  { icon: "🎯", title: "AI 광고주 추천" },
  { icon: "🔍", title: "AI 시장조사" },
  { icon: "🥊", title: "AI 경쟁사 분석" },
  { icon: "📝", title: "AI 맞춤형 광고 제안서 생성" },
  { icon: "🧩", title: "AI 광고 상품 추천" },
  { icon: "📊", title: "AI 광고 성과 분석" },
  { icon: "💹", title: "AI ROI 리포트 생성" },
  { icon: "🔁", title: "AI 재계약 및 업셀링 추천" },
];

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <p className="text-xs sm:text-sm font-mono text-cyan-300/80 mb-2">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h2>
      {desc && <p className="text-white/50 text-sm sm:text-base max-w-2xl">{desc}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 10%, rgba(109,91,255,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(34,211,201,0.3), transparent 45%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <p className="text-xs sm:text-sm font-mono text-violet-300/80 mb-4">
            놀이의발견 · Internal AI Tool
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight max-w-3xl">
            AI 기반 광고주 유치 및
            <br />
            광고 운영 자동화 플랫폼
          </h1>
          <p className="mt-6 max-w-2xl text-white/60 text-sm sm:text-base leading-relaxed">
            OTA 수수료 중심의 수익 구조를 광고 기반 수익 모델로 전환합니다. 영업 담당자에 의존하지 않고, 일반 운영
            담당자도 AI를 활용해 광고 사업을 운영할 수 있는 내부 AI 업무 지원 플랫폼을 목표로 합니다.
          </p>
          <div className="mt-10">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm sm:text-base font-semibold text-black"
            >
              키워드로 AI 분석 시작하기 →
            </a>
          </div>
        </div>
      </section>

      {/* AI 적용 범위 */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-b border-white/10">
        <SectionHeading
          eyebrow="AI SCOPE"
          title="AI 적용 범위"
          desc="시장조사부터 재계약·업셀링까지, 광고 사업의 전 과정을 AI가 지원합니다."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AI_SCOPE.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs sm:text-sm text-white/70">{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-b border-white/10">
        <SectionHeading
          eyebrow="WORKFLOW"
          title="AI 업무 자동화 흐름"
          desc="회원 행동 데이터 분석부터 재계약·업셀링 추천까지 하나의 파이프라인으로 연결됩니다."
        />
        <WorkflowDiagram />
      </section>

      {/* Demo */}
      <section id="demo" className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-b border-white/10">
        <SectionHeading
          eyebrow="LIVE DEMO"
          title="키워드 한 번으로 시작하는 AI 분석"
          desc="브랜드명이나 업종 키워드를 입력하면 시장조사부터 ROI 리포트까지 전 과정이 자동으로 진행됩니다. (현재는 목업 데이터로 흐름을 시연하는 데모입니다)"
        />
        <PipelineDemo />
      </section>

      {/* Advertiser categories */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-b border-white/10">
        <SectionHeading
          eyebrow="ADVERTISER DATABASE"
          title="광고주 후보 카테고리"
          desc="18개 업종, 200여 개 브랜드의 광고주 후보 데이터베이스를 기반으로 AI가 추천을 수행합니다."
        />
        <CategoryBrowser />
      </section>

      {/* Top 30 */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="AI RECOMMENDATION"
          title="AI 추천 우선순위"
          desc="자사 트래픽·세그먼트와의 정합성을 기준으로 산출된 우선 컨택 대상입니다."
        />
        <TopRecommendations />
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-white/30">
        © 놀이의발견 — AI 광고 자동화 플랫폼 (내부용 데모)
      </footer>
    </main>
  );
}
