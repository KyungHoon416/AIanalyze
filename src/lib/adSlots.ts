export type AdSlot = {
  id: string;
  name: string;
  location: string;
  format: string;
  conversionMin: number;
  conversionMax: number;
  listPrice: number;
  promoPrice: number;
  priceUnit: "주" | "월";
  description: string;
};

// "놀이의발견 광고 마케팅 제안서" 실제 자료(image/) 기준 5개 구좌의 정가/프로모션가/전환율 데이터.
export const AD_SLOTS: AdSlot[] = [
  {
    id: "splash",
    name: "스플래쉬",
    location: "앱 로딩 화면 (앱 실행 순간)",
    format: "Splash 광고 — 브랜드 단독 노출",
    conversionMin: 12,
    conversionMax: 25,
    listPrice: 7_000_000,
    promoPrice: 4_900_000,
    priceUnit: "주",
    description: "앱 실행 순간 브랜드를 독점 노출하는 최상위 프리미엄 지면.",
  },
  {
    id: "main-banner",
    name: "메인배너",
    location: "MAIN 상단 메인",
    format: "월 고정 배너 — 메인 홈 기획전 배너",
    conversionMin: 10,
    conversionMax: 12,
    listPrice: 5_000_000,
    promoPrice: 3_500_000,
    priceUnit: "월",
    description: "50만 MAU 고객에게 가장 먼저 노출되는 메인 광고.",
  },
  {
    id: "popup",
    name: "팝업",
    location: "MAIN 진입 팝업",
    format: "팝업 광고 — 앱 실행 순간 브랜드 경험",
    conversionMin: 12,
    conversionMax: 15,
    listPrice: 3_500_000,
    promoPrice: 2_000_000,
    priceUnit: "월",
    description: "앱 실행 순간 가장 먼저 브랜드를 경험시키는 강력한 주목도의 지면.",
  },
  {
    id: "category",
    name: "카테고리",
    location: "카테고리 메인 영역 (GNB 아이콘)",
    format: "월 고정 구좌 — 카테고리 구좌 광고",
    conversionMin: 8,
    conversionMax: 10,
    listPrice: 2_500_000,
    promoPrice: 1_750_000,
    priceUnit: "월",
    description: "브랜드 노출과 구좌 전환을 동시에 만드는 카테고리 광고.",
  },
  {
    id: "sub-banner",
    name: "서브 배너",
    location: "MAIN 중/하단",
    format: "월 고정 배너 — 메인 서브 배너",
    conversionMin: 4,
    conversionMax: 5,
    listPrice: 1_500_000,
    promoPrice: 1_050_000,
    priceUnit: "월",
    description: "서치식 탐색 동선에 자연스럽게 스며드는 광고 구좌.",
  },
];

function monthlyPrice(amount: number, unit: "주" | "월"): number {
  return unit === "주" ? Math.round(amount * 4.345) : amount;
}

export function monthlyListPrice(slot: AdSlot): number {
  return monthlyPrice(slot.listPrice, slot.priceUnit);
}

export function monthlyPromoPrice(slot: AdSlot): number {
  return monthlyPrice(slot.promoPrice, slot.priceUnit);
}

export function formatPrice(amount: number, unit: "주" | "월"): string {
  return `${unit} ${amount.toLocaleString()}원`;
}

export function formatRate(min: number, max: number): string {
  return `${min}% ~ ${max}%`;
}
