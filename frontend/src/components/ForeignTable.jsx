import { useState } from "react"
import { isKorean } from "../data/koreanCompanies"

export default function ForeignTable({ data }) {
  const [query, setQuery] = useState("")
  const [koOnly, setKoOnly] = useState(false)

  const filtered = data.filter(d => {
    const matchQuery = d.game_name.includes(query) || d.company.includes(query)
    const matchKo = koOnly ? isKorean(d.company) : true
    return matchQuery && matchKo
  })

  const koreanCount = data.filter(d => isKorean(d.company)).length

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #f0f0f0", padding: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🌏 외자 판호</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>
            해외 게임 전체 · 한국 게임 {koreanCount}건 포함
          </p>
        </div>
        <span style={{ background: "#f5f5f5", color: "#555",
          borderRadius: 12, padding: "2px 10px", fontSize: 13 }}>
          {filtered.length}건
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setKoOnly(!koOnly)}
          style={{
            padding: "4px 14px", borderRadius: 12, fontSize: 12,
            border: "1px solid",
            borderColor: koOnly ? "#e53e3e" : "#e8e8e8",
            background: koOnly ? "#e53e3e" : "#fafafa",
            color: koOnly ? "#fff" : "#666",
            cursor: "pointer", fontWeight: koOnly ? 600 : 400,
          }}>
          🇰🇷 한국 게임만 보기
        </button>
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
                {["게임명", "회사", "판호번호", "플랫폼"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left",
                    color: "#999", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const korean = isKorean(d.company)
                return (
                  <tr key={i}
                    style={{
                      borderBottom: "1px solid #f5f5f5",
                      background: korean ? "#fff5f5" : "",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = korean ? "#ffe8e8" : "#f9f9f9"}
                    onMouseLeave={e => e.currentTarget.style.background = korean ? "#fff5f5" : ""}>
                    <td style={{ padding: "9px 10px", fontWeight: 500 }}>
                      {korean && <span style={{ marginRight: 4 }}>🇰🇷</span>}
                      {d.game_name}
                    </td>
                    <td style={{ padding: "9px 10px", color: "#555", fontSize: 12 }}>{d.company}</td>
                    <td style={{ padding: "9px 10px", fontFamily: "monospace",
                      color: "#888", fontSize: 12 }}>{d.license_number}</td>
                    <td style={{ padding: "9px 10px", color: "#aaa", fontSize: 12 }}>{d.platform}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
