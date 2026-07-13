// 외자 판호에서 한국 게임사 감지 (회사명에 포함 여부로 판단)
export const KOREAN_COMPANIES = [
  "넥슨", "Nexon",
  "넷마블", "Netmarble",
  "엔씨소프트", "NCSoft", "NCSOFT",
  "크래프톤", "Krafton",
  "스마일게이트", "Smilegate",
  "컴투스", "Com2uS",
  "카카오게임즈", "Kakao Games",
  "위메이드", "Wemade",
  "펄어비스", "Pearl Abyss",
  "그라비티", "Gravity",
  "라인게임즈", "LINE Games",
  "님블뉴런", "Nimble Neuron",
  "에픽게임즈", "Epic Games",   // 한국법인
]

export function isKorean(company) {
  return KOREAN_COMPANIES.some(k =>
    company?.toLowerCase().includes(k.toLowerCase())
  )
}