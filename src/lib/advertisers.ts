export type AdvertiserCategory = {
  slug: string;
  icon: string;
  title: string;
  advertisers: string[];
};

// OTA 직접 경쟁사(야놀자, 여기어때)는 광고주 후보에서 제외한다.
// 놀이의발견의 전략 자체가 "OTA 수수료 구조 탈피"이므로, 동종 OTA는 잠재 광고주가 아닌 경쟁사로 분류.
export const CATEGORIES: AdvertiserCategory[] = [
  {
    slug: "travel",
    icon: "🏨",
    title: "여행·숙박",
    advertisers: [
      "한화리조트",
      "소노호텔앤리조트",
      "켄싱턴호텔앤리조트",
      "롯데호텔",
      "신라호텔",
      "호텔스닷컴",
      "아고다",
      "트립닷컴",
      "제주신화월드",
      "파라다이스시티",
      "워커힐",
      "글래드호텔",
      "라한호텔",
    ],
  },
  {
    slug: "leisure",
    icon: "🎡",
    title: "레저·테마파크",
    advertisers: [
      "에버랜드",
      "롯데월드",
      "서울랜드",
      "레고랜드 코리아",
      "아쿠아플라넷",
      "서울스카이",
      "코엑스 아쿠아리움",
      "원마운트",
      "웅진플레이도시",
      "캐리비안베이",
      "오션월드",
      "키자니아",
      "뽀로로파크",
      "챔피언1250",
      "바운스트램폴린",
    ],
  },
  {
    slug: "dining",
    icon: "🍽️",
    title: "외식",
    advertisers: [
      "아웃백",
      "빕스",
      "애슐리",
      "TGIF",
      "명륜진사갈비",
      "본죽",
      "본도시락",
      "홍콩반점",
      "역전우동",
      "새마을식당",
      "한솥",
      "서브웨이",
      "노브랜드버거",
      "맘스터치",
      "쉐이크쉑",
    ],
  },
  {
    slug: "fastfood",
    icon: "🍔",
    title: "패스트푸드",
    advertisers: ["맥도날드", "버거킹", "롯데리아", "KFC", "프랭크버거"],
  },
  {
    slug: "chicken",
    icon: "🍗",
    title: "치킨",
    advertisers: ["BBQ", "bhc", "교촌치킨", "굽네치킨", "처갓집", "네네치킨", "자담치킨"],
  },
  {
    slug: "cafe",
    icon: "☕",
    title: "카페",
    advertisers: [
      "스타벅스",
      "투썸플레이스",
      "메가커피",
      "빽다방",
      "컴포즈커피",
      "이디야",
      "할리스",
      "폴바셋",
      "커피빈",
      "엔제리너스",
    ],
  },
  {
    slug: "food",
    icon: "🥗",
    title: "식품",
    advertisers: [
      "CJ제일제당",
      "풀무원",
      "오뚜기",
      "농심",
      "삼양식품",
      "동원F&B",
      "대상",
      "빙그레",
      "매일유업",
      "남양유업",
      "서울우유",
      "일동후디스",
      "하림",
    ],
  },
  {
    slug: "fashion",
    icon: "👕",
    title: "패션",
    advertisers: [
      "무신사",
      "지그재그",
      "에이블리",
      "W컨셉",
      "29CM",
      "탑텐",
      "스파오",
      "유니클로",
      "폴햄",
      "MLB",
      "디스커버리",
      "내셔널지오그래픽",
      "K2",
      "코오롱스포츠",
      "노스페이스",
    ],
  },
  {
    slug: "beauty",
    icon: "💄",
    title: "뷰티",
    advertisers: [
      "올리브영",
      "아모레퍼시픽",
      "LG생활건강",
      "이니스프리",
      "에뛰드",
      "닥터지",
      "메디힐",
      "토리든",
      "라운드랩",
      "달바",
    ],
  },
  {
    slug: "commerce",
    icon: "🛒",
    title: "쇼핑·커머스",
    advertisers: ["쿠팡", "컬리", "SSG닷컴", "롯데ON", "11번가", "G마켓", "옥션", "오늘의집", "다이소", "올리브영"],
  },
  {
    slug: "finance",
    icon: "💳",
    title: "금융",
    advertisers: [
      "KB국민카드",
      "신한카드",
      "삼성카드",
      "현대카드",
      "하나카드",
      "우리카드",
      "NH농협카드",
      "카카오뱅크",
      "토스",
      "케이뱅크",
    ],
  },
  {
    slug: "auto",
    icon: "🚗",
    title: "자동차",
    advertisers: [
      "현대자동차",
      "기아",
      "제네시스",
      "BMW 코리아",
      "메르세데스-벤츠 코리아",
      "볼보자동차코리아",
      "렉서스코리아",
      "토요타코리아",
      "르노코리아",
      "KG모빌리티",
    ],
  },
  {
    slug: "it",
    icon: "📱",
    title: "IT·전자",
    advertisers: ["삼성전자", "LG전자", "Apple", "LG유플러스", "SK텔레콤", "KT", "Dyson", "샤오미", "ASUS", "레노버"],
  },
  {
    slug: "game",
    icon: "🎮",
    title: "게임",
    advertisers: ["넥슨", "넷마블", "크래프톤", "엔씨소프트", "카카오게임즈", "스마일게이트", "펄어비스"],
  },
  {
    slug: "education",
    icon: "📚",
    title: "교육",
    advertisers: ["웅진씽크빅", "대교", "아이스크림에듀", "천재교육", "비상교육", "메가스터디", "윤선생", "교원"],
  },
  {
    slug: "kids",
    icon: "👶",
    title: "육아",
    advertisers: ["하기스", "팸퍼스", "베베숲", "아가방", "압타밀", "일동후디스", "베베드피노", "블루독베이비"],
  },
  {
    slug: "healthcare",
    icon: "🏥",
    title: "헬스케어",
    advertisers: ["GC녹십자", "종근당", "유한양행", "동국제약", "대웅제약", "셀트리온", "정관장"],
  },
  {
    slug: "camping",
    icon: "🏕️",
    title: "캠핑·아웃도어",
    advertisers: ["코베아", "스노우피크", "헬리녹스", "콜맨", "블랙야크", "K2", "네이처하이크"],
  },
];

// AI 추천 우선순위 — 원본 TOP 30에서 OTA 경쟁사(야놀자, 여기어때) 2건 제외 후 재정렬
export const TOP_RECOMMENDATIONS: string[] = [
  "에버랜드",
  "스타벅스",
  "무신사",
  "CJ제일제당",
  "풀무원",
  "현대자동차",
  "KB국민카드",
  "쿠팡",
  "올리브영",
  "BBQ",
  "메가커피",
  "롯데월드",
  "한화리조트",
  "레고랜드 코리아",
  "아웃백",
  "교촌치킨",
  "빙그레",
  "매일유업",
  "삼성전자",
  "LG전자",
  "신한카드",
  "컬리",
  "디스커버리",
  "노스페이스",
  "웅진씽크빅",
  "아모레퍼시픽",
  "다이소",
  "토스",
];

export const EXCLUDED_ADVERTISERS = ["야놀자", "여기어때"];

export function findCategoryForAdvertiser(name: string): AdvertiserCategory | undefined {
  return CATEGORIES.find((c) => c.advertisers.includes(name));
}

export function findAdvertisersByKeyword(keyword: string): { advertiser: string; category: AdvertiserCategory }[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  const results: { advertiser: string; category: AdvertiserCategory }[] = [];
  for (const category of CATEGORIES) {
    for (const advertiser of category.advertisers) {
      if (
        advertiser.toLowerCase().includes(q) ||
        category.title.toLowerCase().includes(q) ||
        category.slug.includes(q)
      ) {
        results.push({ advertiser, category });
      }
    }
  }
  return results;
}
