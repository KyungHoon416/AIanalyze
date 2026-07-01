export type AdSlot = {
  id: string;
  name: string;
  location: string;
  format: string;
  ctrMin: number;
  ctrMax: number;
  cvrMin: number;
  cvrMax: number;
  price: number;
  priceUnit: "주" | "월";
  description: string;
};

// "광고 제안서 - 놀이의발견.pdf" 예시안의 상품 구성을 5개 구좌로 정리한 실제 가격/성과 데이터.
export const AD_SLOTS: AdSlot[] = [
  {
    id: "splash",
    name: "스플래쉬",
    location: "앱 인트로 화면",
    format: "앱 진입 시 전체 화면 노출 (3~5초)",
    ctrMin: 20,
    ctrMax: 25,
    cvrMin: 10,
    cvrMax: 15,
    price: 4_900_000,
    priceUnit: "주",
    description: "앱 실행과 동시에 100% 도달하는 프리미엄 지면. 브랜드 인지도·신상품 홍보에 최적.",
  },
  {
    id: "main-banner",
    name: "메인배너",
    location: "홈 상단 메인",
    format: "홈 화면 진입 시 최상단 롤링 배너",
    ctrMin: 10,
    ctrMax: 15,
    cvrMin: 5,
    cvrMax: 10,
    price: 3_500_000,
    priceUnit: "월",
    description: "앱 실행 후 가장 먼저 시선이 가는 위치. 핵심 프로모션·시즌 이벤트 홍보에 탁월.",
  },
  {
    id: "popup",
    name: "팝업",
    location: "앱 진입 시 팝업",
    format: "앱 진입 시 전체 팝업 윈도우",
    ctrMin: 15,
    ctrMax: 20,
    cvrMin: 8,
    cvrMax: 12,
    price: 2_000_000,
    priceUnit: "월",
    description: "모든 사용자에게 노출되는 강력한 주목도. 긴급 공지·기간 한정 프로모션에 효과적.",
  },
  {
    id: "category",
    name: "카테고리",
    location: "카테고리 GNB / 상세 페이지",
    format: "카테고리 퀵 아이콘 배치 및 상세 정보 상단 노출",
    ctrMin: 2.5,
    ctrMax: 12,
    cvrMin: 2.5,
    cvrMax: 8,
    price: 1_750_000,
    priceUnit: "월",
    description: "이미 관심이 형성된 카테고리 탐색 고객에게 관련성 높은 메시지로 소구.",
  },
  {
    id: "sub-banner",
    name: "서브 배너",
    location: "홈 중/하단 배너",
    format: "홈 화면 스크롤 시 중단 고정/롤링 배너",
    ctrMin: 5,
    ctrMax: 10,
    cvrMin: 3,
    cvrMax: 7,
    price: 1_050_000,
    priceUnit: "월",
    description: "콘텐츠 탐색 흐름을 방해하지 않으면서 다양한 프로모션을 상세히 소개하기 좋음.",
  },
];

export function formatPrice(slot: AdSlot): string {
  return `${slot.priceUnit} ${slot.price.toLocaleString()}원`;
}

export function formatRate(min: number, max: number): string {
  return `${min}% ~ ${max}%`;
}
