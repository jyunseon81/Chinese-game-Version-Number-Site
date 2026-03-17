import { useState } from "react"

const MAJOR_COMPANIES = [
  { label: "텐센트",  key: "腾讯",   color: "#1677ff" },
  { label: "넷이즈",  key: "网易",   color: "#eb2f96" },
  { label: "미호요",  key: "米哈游", color: "#722ed1" },
  { label: "37게임즈", key: "三七互娱", color: "#fa8c16" },
  { label: "탄완",    key: "弹弹堂", color: "#13c2c2" },
  { label: "킹넷",    key: "卡游",   color: "#f5222d" },
  { label: "타런",    key: "他人",   color: "#52c41a" },
  { label: "아워팜",  key: "我们的",  color: "#faad14" },
]

function getColor(company) {
  for (const c of MAJOR_COMPANIES) {
    if (company?.includes(c.key)) return c.color
  }
  return "#888"
}

function isMajor(company) {
  return MAJOR_COMPANIES.some(c => company?.includes(c.key))
}

export default function DomesticTable({ data }) {
  const [query, setQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("전체")

  const filtered = data.filter(d => {
    const matchQuery =
      d.game_name?.includes(query) ||
      d.operator?.includes(query)
    const matchCompany =
      selectedCompany === "전체" ||
      d.operator?.includes(selectedCompany)
    return matchQuery && matchCompany
  })

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #f0f0f0", padding: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🏠 내자 판호</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>전체 국산 게임</p>
        </div>
        <span style={{ background: "#f5f5f5", color: "#555",
          borderRadius: 12, padding: "2px 10px", fontSize: 13 }}>
          {filtered.length}건
        </span>
      </div>

      {/* 필터 버튼 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {/* 전체 버튼 */}
        <button
          onClick={() => setSelectedCompany("전체")}
          style={{
            padding: "4px 12px", borderRadius: 12, fontSize: 12,
            border: "1px solid",
            borderColor: selectedCompany === "전체" ? "#1a73e8" : "#e8e8e8",
            background: selectedCompany === "전체" ? "#1a73e8" : "#fafafa",
            color: selectedCompany === "전체" ? "#fff" : "#666",
            cursor: "pointer", fontWeight: selectedCompany === "전체" ? 600 : 400,
          }}>
          전체
        </button>

        {/* 주요 게임사 버튼 */}
        {MAJOR_COMPANIES.map(c => {
          const count = data.filter(d => d.operator?.includes(c.key)).length
          const isSelected = selectedCompany === c.key
          return (
            <button
              key={c.key}
              onClick={() => setSelectedCompany(isSelected ? "전체" : c.key)}
              style={{
                padding: "4px 12px", borderRadius: 12, fontSize: 12,
                border: "1px solid",
                borderColor: isSelected ? c.color : "#e8e8e8",
                background: isSelected ? c.color : "#fafafa",
                color: isSelected ? "#fff" : "#555",
                cursor: "pointer",
                fontWeight: isSelected ? 600 : 400,
                opacity: count === 0 ? 0.35 : 1,
              }}>
              {c.label}
              {count > 0 && (
                <span style={{
                  marginLeft: 4,
                  background: isSelected ? "rgba(255,255,255,0.3)" : c.color + "22",
                  color: isSelected ? "#fff" : c.color,
                  borderRadius: 8, padding: "0 5px",
                  fontSize: 11,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <input
        placeholder="게임명 또는 회사명 검색..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "7px 12px", borderRadius: 8,
          border: "1px solid #e8e8e8", fontSize: 14,
          marginBottom: 12, outline: "none",
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: "#ccc", textAlign: "center", padding: "24px 0", fontSize: 14 }}>
          {selectedCompany === "전체" ? "데이터가 없습니다" : `이번 달 ${
            MAJOR_COMPANIES.find(c => c.key === selectedCompany)?.label
          } 판호가 없습니다`}
        </p>
      ) : (
        <div style={{ overflowX: "auto", maxHeight: 600, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                {["게임명", "운영사", "판호번호", "승인일"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left",
                    color: "#999", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i}
                  style={{
                    borderBottom: "1px solid #f5f5f5",
                    background: isMajor(d.operator) ? getColor(d.operator) + "08" : "",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background =
                    isMajor(d.operator) ? getColor(d.operator) + "08" : ""}>
                  <td style={{ padding: "9px 10px", fontWeight: 500 }}>{d.game_name}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{
                      background: getColor(d.operator) + "18",
                      color: getColor(d.operator),
                      borderRadius: 6, padding: "2px 7px",
                      fontSize: 12, fontWeight: 500,
                    }}>
                      {d.operator}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px", fontFamily: "monospace",
                    color: "#888", fontSize: 12 }}>{d.license_number}</td>
                  <td style={{ padding: "9px 10px", color: "#aaa", fontSize: 12 }}>{d.approved_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
