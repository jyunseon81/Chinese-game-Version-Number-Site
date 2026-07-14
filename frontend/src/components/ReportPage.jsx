import { useState, useEffect } from "react"

const BASE = "/Chinese-game-Version-Number-Site/data"
const RAWG_KEY = "2e7d3c82fdac48a48e8418440813a07e"

const MAJOR_COMPANIES = [
  { label: "텐센트",    key: "腾讯",    color: "#1677ff" },
  { label: "넷이즈",    key: "网易",    color: "#eb2f96" },
  { label: "미호요",    key: "米哈游",  color: "#722ed1" },
  { label: "37게임즈",  key: "三七互娱", color: "#fa8c16" },
  { label: "탄완",      key: "贪玩",    color: "#13c2c2" },
  { label: "킹넷",      key: "恺英",    color: "#f5222d" },
  { label: "타런",      key: "塔人",    color: "#52c41a" },
  { label: "아워팜",    key: "掌趣",    color: "#faad14" },
  { label: "4399",      key: "四三九九",    color: "#ff6b35" },
  { label: "빌리빌리",  key: "哔哩哔哩", color: "#00a1d6" },
  { label: "자이언트",  key: "巨人网络", color: "#7c3aed" },
  { label: "퍼펙트월드", key: "完美世界", color: "#0ea5e9" },
  { label: "링시게임즈", key: "灵犀互娱", color: "#d97706" },
  { label: "바이트댄스", key: "字节跳动", color: "#333333" },
]

const KOREAN_DEVELOPERS = [
  "nexon", "netmarble", "ncsoft", "krafton", "smilegate",
  "com2us", "kakao", "wemade", "pearl abyss", "gravity",
  "neowiz", "webzen", "devsisters", "shift up", "nimble neuron",
  "xlgames", "4:33", "joycity", "gamevil", "vespa",
  "넥슨", "넷마블", "엔씨소프트", "크래프톤", "스마일게이트",
  "컴투스", "카카오", "위메이드", "펄어비스", "그라비티",
]

// 알려진 한국 IP 게임 중국어 → 영문명 매핑
const KOREAN_IP_MAPPING = {
  "夜鸦": "Night Crows",
  "黎明觉醒": "Dawn of Awakening",
  "泡泡玛特": "",
  "菜鸟冒险": "",
  "天涯明月刀": "Age of Wulin",
  "奥比岛": "Aurcus Online",
  "蓝色协议": "Blue Protocol",
  "流放之路": "Path of Exile",
  "命运方舟": "Lost Ark",
  "黑色沙漠": "Black Desert",
  "天堂W": "Lineage W",
  "永劫无间": "Naraka Bladepoint",
}

function isKoreanDev(developerName) {
  const lower = developerName?.toLowerCase() || ""
  return KOREAN_DEVELOPERS.some(k => lower.includes(k.toLowerCase()))
}

function getCompany(operator, publisher) {
  for (const c of MAJOR_COMPANIES) {
    if (operator?.includes(c.key) || publisher?.includes(c.key)) return c
  }
  return null
}

function getCompanyName(operator, publisher) {
  for (const c of MAJOR_COMPANIES) {
    if (operator?.includes(c.key)) return { label: c.label, cn: operator }
    if (publisher?.includes(c.key)) return { label: c.label, cn: publisher }
  }
  return null
}
// 중국어 → 영문 자동 번역
async function translateToEnglish(chineseName) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chineseName)}&langpair=zh|en`
    )
    const data = await res.json()
    const translated = data.responseData?.translatedText || ""
    // 번역 실패하거나 중국어 그대로면 원문 반환
    if (!translated || translated === chineseName) return chineseName
    console.log(`번역: ${chineseName} → ${translated}`)
    return translated
  } catch {
    return chineseName
  }
}
// RAWG API로 게임 검색
async function searchRAWG(gameName) {
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(gameName)}&page_size=3`
    )
    const data = await res.json()
    return data.results || []
  } catch {
    return []
  }
}

export default function ReportPage({ month, onClose }) {
  const [domestic, setDomestic] = useState([])
  const [foreign, setForeign]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [editData, setEditData] = useState({ domestic: [], foreign: [] })
  const [initialized, setInitialized] = useState(false)
  const [searching, setSearching] = useState(false)
  const [koreanIPs, setKoreanIPs] = useState([])

  const displayMonth = `${month?.split("-")[0]}/${parseInt(month?.split("-")[1])}월`

  useEffect(() => {
    if (!month) return
    setLoading(true)
    const load = (type) =>
      fetch(`${BASE}/${month}-${type}.json`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])
    Promise.all([load("内资"), load("外资")]).then(([dom, for_]) => {
      setDomestic(dom)
      setForeign(for_)

      const majorDom = dom
        .filter(d => getCompany(d.operator, d.publisher))
        .map((d, i) => {
          const co = getCompanyName(d.operator, d.publisher)
          return {
            no: i + 1,
            company_label: co?.label || "",
            company_cn: co?.cn || d.operator,
            company_sub: "",
            game_name_cn: d.game_name,
            game_name_kr: "",
            platform: "",
            genre: "",
            features: "",
            license_number: d.license_number,
            approved_date: d.approved_date,
          }
        })

      const majorFor = for_
        .filter(d => getCompany(d.operator, d.publisher))
        .map((d, i) => {
          const co = getCompanyName(d.operator, d.publisher)
          return {
            no: i + 1,
            company_label: co?.label || "",
            company_cn: co?.cn || d.operator,
            company_sub: "",
            game_name_cn: d.game_name,
            game_name_kr: "",
            platform: "",
            genre: "",
            notes: "",
            license_number: d.license_number,
            approved_date: d.approved_date,
          }
        })

      setEditData({ domestic: majorDom, foreign: majorFor })
      setInitialized(true)
      setLoading(false)
    })
  }, [month])



async function searchKoreanIP() {
  setSearching(true)
  setKoreanIPs([])
  const results = []

  for (const game of foreign) {
    // 1. 수동 입력된 영문/한국어명 우선 사용
    const manualName = editData.foreign.find(
      d => d.game_name_cn === game.game_name
    )?.game_name_kr

    // 2. 매핑 테이블 확인 → 없으면 자동 번역
    let searchName = manualName || KOREAN_IP_MAPPING[game.game_name]
    if (!searchName) {
      searchName = await translateToEnglish(game.game_name)
      await new Promise(r => setTimeout(r, 300))
    }

    console.log(`검색: ${game.game_name} → ${searchName}`)

    // 3. 번역된 영문명으로 RAWG 검색
    const rawgResults = await searchRAWG(searchName)
    let found = false
    let matchedGame = null
    let koreanDev = null

    for (const r of rawgResults) {
      try {
        const detail = await fetch(
          `https://api.rawg.io/api/games/${r.id}?key=${RAWG_KEY}`
        ).then(res => res.json())

        const devs = detail.developers || []
        for (const dev of devs) {
          if (isKoreanDev(dev.name)) {
            found = true
            matchedGame = r
            koreanDev = dev.name
            break
          }
        }
      } catch { continue }
      if (found) break
    }

    if (found) {
      results.push({
        game_name_cn: game.game_name,
        game_name_en: matchedGame?.name || searchName,
        operator: game.operator,
        publisher: game.publisher,
        license_number: game.license_number,
        approved_date: game.approved_date,
        korean_dev: koreanDev,
        rawg_url: `https://rawg.io/games/${matchedGame?.slug}`,
        searched_as: searchName,
      })
    }

    await new Promise(r => setTimeout(r, 500))
  }

  setKoreanIPs(results)
  setSearching(false)
}

  function updateDom(idx, field, value) {
    setEditData(prev => ({
      ...prev,
      domestic: prev.domestic.map((d, i) => i === idx ? { ...d, [field]: value } : d)
    }))
  }

  function updateFor(idx, field, value) {
    setEditData(prev => ({
      ...prev,
      foreign: prev.foreign.map((d, i) => i === idx ? { ...d, [field]: value } : d)
    }))
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "5px 8px", borderRadius: 6,
    border: "1px solid #e8e8e8", fontSize: 12,
    fontFamily: "inherit", resize: "vertical",
    background: "#fafffe",
  }

  const thStyle = {
    padding: "10px 12px", textAlign: "left",
    fontWeight: 600, color: "#444",
    borderBottom: "2px solid #e0e0e0",
    borderRight: "1px solid #e0e0e0",
    whiteSpace: "nowrap", background: "#f5f5f5",
  }

  const tdStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    borderRight: "1px solid #f0f0f0",
    verticalAlign: "top",
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#fff",
      zIndex: 1000, overflowY: "auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* 헤더 */}
      <div style={{
        position: "sticky", top: 0, background: "#fff",
        borderBottom: "1px solid #f0f0f0", padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
          📊 {displayMonth} 판호 보고서
        </h1>
        <button onClick={onClose}
          style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13,
            background: "#f5f5f5", color: "#555", border: "none",
            cursor: "pointer"
          }}>
          ✕ 닫기
        </button>
      </div>

      <div style={{ padding: "28px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {loading && <p style={{ color: "#999" }}>데이터 로딩 중...</p>}

        {initialized && (
          <>
            {/* 한국 IP 검색 섹션 */}
            <div style={{
              background: "#fff8f0", borderRadius: 12,
              border: "1px solid #ffe0b2", padding: "20px 24px",
              marginBottom: 32,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                    🇰🇷 외자 판호 한국 IP 검색
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
                    RAWG DB로 외자 판호 {foreign.length}건의 개발사 국적을 자동 검색해요
                  </p>
                </div>
                <button
                  onClick={searchKoreanIP}
                  disabled={searching}
                  style={{
                    padding: "10px 20px", borderRadius: 8, fontSize: 13,
                    background: searching ? "#ccc" : "#e8590c",
                    color: "#fff", border: "none",
                    cursor: searching ? "not-allowed" : "pointer",
                    fontWeight: 600, whiteSpace: "nowrap",
                  }}>
                  {searching ? "검색 중..." : "🔍 한국 IP 검색"}
                </button>
              </div>

              {searching && (
                <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                  ⏳ {foreign.length}개 게임을 순서대로 검색 중... 잠시 기다려주세요
                </p>
              )}

              {!searching && koreanIPs.length > 0 && (
                <div>
                  <p style={{ color: "#e8590c", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                    🎮 한국 IP 게임 {koreanIPs.length}건 발견!
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#fff3e0" }}>
                        {["게임명 (중국어)", "영문명", "한국 개발사", "운영사", "판호번호"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                            fontWeight: 600, color: "#555", borderBottom: "2px solid #ffe0b2" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {koreanIPs.map((d, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #fff3e0",
                          background: i % 2 === 0 ? "#fff" : "#fff8f0" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{d.game_name_cn}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <a href={d.rawg_url} target="_blank" rel="noreferrer"
                              style={{ color: "#1a73e8", textDecoration: "none" }}>
                              {d.game_name_en}
                            </a>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#e8590c", fontWeight: 500 }}>
                            {d.korean_dev}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#555", fontSize: 12 }}>
                            {d.operator}
                          </td>
                          <td style={{ padding: "10px 12px", fontFamily: "monospace",
                            color: "#888", fontSize: 12 }}>{d.license_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!searching && koreanIPs.length === 0 && foreign.length > 0 && (
                <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>
                  검색 버튼을 눌러 한국 IP 게임을 찾아보세요
                </p>
              )}
            </div>

            {/* 안내 */}
            <div style={{
              background: "#f0f7ff", borderRadius: 10,
              padding: "14px 18px", marginBottom: 28, fontSize: 13, color: "#444"
            }}>
              💡 회사 부연설명, 게임명 한국어, 플랫폼, 장르, 게임 특징/비고를 직접 입력해주세요.
            </div>

            {/* 내자 보고서 */}
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              [참고] {displayMonth} 주요 게임사 내자 판호 발급 내역
            </h2>
            {editData.domestic.length === 0 ? (
              <p style={{ color: "#ccc", marginBottom: 32 }}>이번 달 주요 게임사 내자 판호가 없습니다</p>
            ) : (
              <div style={{ overflowX: "auto", marginBottom: 40 }}>
                <table style={{ width: "100%", borderCollapse: "collapse",
                  fontSize: 13, border: "1px solid #e0e0e0" }}>
                  <thead>
                    <tr>
                      {["　", "기업명", "게임명", "플랫폼", "장르", "게임 특징"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editData.domestic.map((d, i) => {
                      const co = MAJOR_COMPANIES.find(c => d.company_label === c.label)
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ ...tdStyle, textAlign: "center", color: "#aaa", width: 32 }}>{d.no}</td>
                          <td style={{ ...tdStyle, minWidth: 160 }}>
                            <div style={{ fontWeight: 700, color: co?.color || "#333", marginBottom: 4 }}>
                              {d.company_label}
                            </div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{d.company_cn}</div>
                            <input value={d.company_sub}
                              onChange={e => updateDom(i, "company_sub", e.target.value)}
                              placeholder="(예: 텐센트 자회사)" style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 140 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.game_name_cn}</div>
                            <input value={d.game_name_kr}
                              onChange={e => updateDom(i, "game_name_kr", e.target.value)}
                              placeholder="한국어 발음" style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input value={d.platform}
                              onChange={e => updateDom(i, "platform", e.target.value)}
                              placeholder="모바일, PC..." style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input value={d.genre}
                              onChange={e => updateDom(i, "genre", e.target.value)}
                              placeholder="장르" style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 220 }}>
                            <textarea value={d.features}
                              onChange={e => updateDom(i, "features", e.target.value)}
                              placeholder="게임 특징 입력" rows={3} style={inputStyle} />
                            <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                              {d.license_number} · {d.approved_date}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 외자 보고서 */}
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              [참고] {displayMonth} 주요 게임사 외자 판호 발급 내역
            </h2>
            {editData.foreign.length === 0 ? (
              <p style={{ color: "#ccc" }}>이번 달 주요 게임사 외자 판호가 없습니다</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse",
                  fontSize: 13, border: "1px solid #e0e0e0" }}>
                  <thead>
                    <tr>
                      {["　", "기업명", "게임명", "플랫폼", "장르", "비고"].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editData.foreign.map((d, i) => {
                      const co = MAJOR_COMPANIES.find(c => d.company_label === c.label)
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ ...tdStyle, textAlign: "center", color: "#aaa", width: 32 }}>{d.no}</td>
                          <td style={{ ...tdStyle, minWidth: 160 }}>
                            <div style={{ fontWeight: 700, color: co?.color || "#fa8c16", marginBottom: 4 }}>
                              {d.company_label}
                            </div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{d.company_cn}</div>
                            <input value={d.company_sub}
                              onChange={e => updateFor(i, "company_sub", e.target.value)}
                              placeholder="(예: 텐센트 자회사)" style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 140 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.game_name_cn}</div>
                            <input value={d.game_name_kr}
                              onChange={e => updateFor(i, "game_name_kr", e.target.value)}
                              placeholder="한국어 게임명" style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input value={d.platform}
                              onChange={e => updateFor(i, "platform", e.target.value)}
                              placeholder="모바일, PC..." style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input value={d.genre}
                              onChange={e => updateFor(i, "genre", e.target.value)}
                              placeholder="장르" style={inputStyle} />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 220 }}>
                            <textarea value={d.notes}
                              onChange={e => updateFor(i, "notes", e.target.value)}
                              placeholder="비고 입력" rows={3} style={inputStyle} />
                            <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                              {d.license_number} · {d.approved_date}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}