import { useState, useEffect } from "react"

const BASE = "/Chinese-game-Version-Number-Site/data"

export default function MonthlyReport({ month }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!month) return
    setLoading(true)
    fetch(`${BASE}/report-${month}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setReport(data); setLoading(false) })
      .catch(() => { setReport(null); setLoading(false) })
  }, [month])

  if (loading || !report) return null

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #f0f0f0", padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      marginTop: 24,
    }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>
        📋 {report.title}
      </h2>

      {/* 총계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "14px 18px" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>내자 판호</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1a73e8" }}>
            {report.domestic_total}종
          </div>
          <div style={{
            fontSize: 12, marginTop: 2,
            color: report.domestic_yoy?.includes("▲") ? "#52c41a" : "#f5222d"
          }}>
            YoY {report.domestic_yoy}
          </div>
        </div>
        <div style={{ background: "#fff7e6", borderRadius: 10, padding: "14px 18px" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>외자 판호</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fa8c16" }}>
            {report.foreign_total}종
          </div>
          <div style={{
            fontSize: 12, marginTop: 2,
            color: report.foreign_yoy?.includes("▲") ? "#52c41a" : "#f5222d"
          }}>
            YoY {report.foreign_yoy}
          </div>
        </div>
      </div>

      {/* 1) 총괄 요약 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.8 }}>
          1) {report.summary}
        </div>
      </div>

      {/* 2) 파트너사 */}
      {report.partner && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>
            2) 파트너사 발급 내역
          </div>
          <div style={{
            background: "#fafafa", borderRadius: 8, padding: "12px 16px",
            fontSize: 13, color: "#555", lineHeight: 1.8, whiteSpace: "pre-wrap"
          }}>
            {report.partner}
          </div>
        </div>
      )}

      {/* 3) 메이저 게임사 */}
      {report.major && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>
            3) 메이저 게임사 발급 내역
          </div>
          <div style={{
            background: "#fafafa", borderRadius: 8, padding: "12px 16px",
            fontSize: 13, color: "#555", lineHeight: 1.8, whiteSpace: "pre-wrap"
          }}>
            {report.major}
          </div>
        </div>
      )}

      {/* 4) 한국 IP */}
      {report.korean_ip && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>
            4) 한국 IP 판호
          </div>
          <div style={{
            background: "#fafafa", borderRadius: 8, padding: "12px 16px",
            fontSize: 13, color: "#555", lineHeight: 1.8
          }}>
            {report.korean_ip}
          </div>
        </div>
      )}
    </div>
  )
}
