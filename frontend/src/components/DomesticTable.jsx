import { useState } from "react"

const MAJOR_COMPANIES = [
  "腾讯", "网易", "米哈游", "完美世界",
  "三七互娱", "字节跳动", "哔哩哔哩", "库洛游戏",
]

const COMPANY_COLORS = {
  "腾讯": "#1677ff", "网易": "#eb2f96", "米哈游": "#722ed1",
  "完美世界": "#13c2c2", "三七互娱": "#fa8c16",
  "字节跳动": "#333", "哔哩哔哩": "#00a1d6", "库洛游戏": "#52c41a",
}

function getColor(company) {
  for (const [key, color] of Object.entries(COMPANY_COLORS)) {
    if (company?.includes(key)) return color
  }
  return "#888"
}

function isMajor(company) {
  return MAJOR_COMPANIES.some(k => company?.includes(k))
}

export default function DomesticTable({ data }) {
  const [query, setQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("전체")

  const majorInData = ["전체", ...MAJOR_COMPANIES.filter(c =>
    data.some(d => d.operator?.includes(c) || d.publisher?.includes(c))
  )]

  const filtered = data.filter(d => {
    const matchQuery =
      d.game_name?.includes(query) ||
      d.operator?.includes(query) ||
      d.publisher?.includes(query)
    const matchCompany =
      selectedCompany === "전체" ||
      d.operator?.includes(selectedCompany) ||
      d.publisher?.includes(selectedCompany)
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

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {majorInData.map(c => (
          <button key={c} onClick={() => setSelectedCompany(c)}
            style={{
              padding: "3px 10px", borderRadius: 12, fontSize: 12,
              border: "1px solid",
              borderColor: selectedCompany === c ? (c === "전체" ? "#1a73e8" : getColor(c)) : "#e8e8e8",
              background: selectedCompany === c ? (c === "전체" ? "#1a73e8" : getColor(c)) : "#fafafa",
              color: selectedCompany === c ? "#fff" : "#666",
              cursor: "pointer",
            }}>
            {c}
          </button>
        ))}
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
          데이터가 없습니다
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
                    background: isMajor(d.operator) || isMajor(d.publisher)
                      ? getColor(d.operator || d.publisher) + "08" : "",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                  onMouseLeave={e => e.currentTarget.style.background =
                    isMajor(d.operator) || isMajor(d.publisher)
                      ? getColor(d.operator || d.publisher) + "08" : ""}>
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
