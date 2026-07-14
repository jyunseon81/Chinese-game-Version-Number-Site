import { useState, useEffect } from "react"

const BASE = "/Chinese-game-Version-Number-Site/data"

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

function getCompany(operator, publisher) {
  for (const c of MAJOR_COMPANIES) {
    if (operator?.includes(c.key) || publisher?.includes(c.key)) return c
  }
  return null
}

function getCompanyName(operator, publisher) {
  // 운영사 또는 출판사 중 주요 게임사 키워드가 있는 쪽 반환
  for (const c of MAJOR_COMPANIES) {
    if (operator?.includes(c.key)) return { label: c.label, cn: operator }
    if (publisher?.includes(c.key)) return { label: c.label, cn: publisher }
  }
  return null
}

export default function ReportPage({ month, onClose }) {
  const [domestic, setDomestic] = useState([])
  const [foreign, setForeign]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [editData, setEditData] = useState({ domestic: [], foreign: [] })
  const [initialized, setInitialized] = useState(false)

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

      // 주요 게임사만 필터링해서 편집 데이터 초기화
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
            {/* 안내 */}
            <div style={{
              background: "#f0f7ff", borderRadius: 10,
              padding: "14px 18px", marginBottom: 28, fontSize: 13, color: "#444"
            }}>
              💡 회사 부연설명, 게임명 한국어, 플랫폼, 장르, 게임 특징/비고를 직접 입력해주세요.
              판호번호와 승인일은 자동으로 채워져 있어요.
            </div>

            {/* 내자 보고서 */}
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#333" }}>
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
                          <td style={{ ...tdStyle, textAlign: "center", color: "#aaa", width: 32 }}>
                            {d.no}
                          </td>
                          <td style={{ ...tdStyle, minWidth: 160 }}>
                            <div style={{ fontWeight: 700, color: co?.color || "#333", marginBottom: 4 }}>
                              {d.company_label}
                            </div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
                              {d.company_cn}
                            </div>
                            <input
                              value={d.company_sub}
                              onChange={e => updateDom(i, "company_sub", e.target.value)}
                              placeholder="(예: 텐센트 자회사)"
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 140 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.game_name_cn}</div>
                            <input
                              value={d.game_name_kr}
                              onChange={e => updateDom(i, "game_name_kr", e.target.value)}
                              placeholder="한국어 발음"
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input
                              value={d.platform}
                              onChange={e => updateDom(i, "platform", e.target.value)}
                              placeholder="모바일, PC..."
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input
                              value={d.genre}
                              onChange={e => updateDom(i, "genre", e.target.value)}
                              placeholder="장르"
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 220 }}>
                            <textarea
                              value={d.features}
                              onChange={e => updateDom(i, "features", e.target.value)}
                              placeholder="게임 특징 입력 (모르면 비워두세요)"
                              rows={3}
                              style={{ ...inputStyle }}
                            />
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
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#333" }}>
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
                          <td style={{ ...tdStyle, textAlign: "center", color: "#aaa", width: 32 }}>
                            {d.no}
                          </td>
                          <td style={{ ...tdStyle, minWidth: 160 }}>
                            <div style={{ fontWeight: 700, color: co?.color || "#fa8c16", marginBottom: 4 }}>
                              {d.company_label}
                            </div>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
                              {d.company_cn}
                            </div>
                            <input
                              value={d.company_sub}
                              onChange={e => updateFor(i, "company_sub", e.target.value)}
                              placeholder="(예: 텐센트 자회사)"
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 140 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.game_name_cn}</div>
                            <input
                              value={d.game_name_kr}
                              onChange={e => updateFor(i, "game_name_kr", e.target.value)}
                              placeholder="한국어 게임명"
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input
                              value={d.platform}
                              onChange={e => updateFor(i, "platform", e.target.value)}
                              placeholder="모바일, PC..."
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 100 }}>
                            <input
                              value={d.genre}
                              onChange={e => updateFor(i, "genre", e.target.value)}
                              placeholder="장르"
                              style={{ ...inputStyle }}
                            />
                          </td>
                          <td style={{ ...tdStyle, minWidth: 220 }}>
                            <textarea
                              value={d.notes}
                              onChange={e => updateFor(i, "notes", e.target.value)}
                              placeholder="비고 입력"
                              rows={3}
                              style={{ ...inputStyle }}
                            />
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