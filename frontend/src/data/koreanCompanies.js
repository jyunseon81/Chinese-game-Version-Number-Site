export const KOREAN_KEYWORDS = [
  "넥슨", "Nexon", "넷마블", "Netmarble",
  "엔씨소프트", "NCSoft", "NCSOFT",
  "크래프톤", "Krafton", "스마일게이트", "Smilegate",
  "컴투스", "Com2uS", "카카오", "Kakao",
  "위메이드", "Wemade", "펄어비스", "Pearl Abyss",
  "그라비티", "Gravity", "라인게임즈", "LINE Games",
]

export function isKorean(company = "") {
  return KOREAN_KEYWORDS.some(k =>
    company.toLowerCase().includes(k.toLowerCase())
  )
}
