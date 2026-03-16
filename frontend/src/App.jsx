import { useState, useEffect } from "react"
import MonthTabs from "./components/MonthTabs"
import DomesticTable from "./components/DomesticTable"
import ForeignTable from "./components/ForeignTable"

export default function App() {
  const [index, setIndex]       = useState([])
  const [month, setMonth]       = useState("")
  const [domestic, setDomestic] = useState([])
  const [foreign, setForeign]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch("/Chinese-game-Version-Number-Site/data/index.json")
      .then(r => r.json())
      .then(data => {
        setIndex(data)
        const latest = data.find(d => d.type === "外资")
        if (latest) setMonth(latest.year_month)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!month) return
    setLoading(true)
    const base = "/Chinese-game-Version-Number-Site/data"
    const load = (type) =>
      fetch(`${base}/${month}-${type}.json`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])

    Promise.all([load("内资"), load("外资")]).then(([dom, for_]) => {
      setDomestic(dom)
      setForeign(for_)
      setLoading(false)
    })
  }, [month])

  const months = [...new Set(index.map(d => d.year_month))].sort().reverse()

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          🇨🇳 중국 게임 판호 모니터
        </h1>
        <p style={{ color: "#888", fontSize: 14, margin: "6px 0 0" }}>
          국가신문출판서(NPPA) 공식 데이터 · 매월 자동 업데이트
        </p>
      </div>

      <MonthTabs months={months} selected={month} onChange={setMonth} />

      {loading ? (
        <p style={{ color: "#999", marginTop: 32 }}>로딩 중...</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24, marginTop: 24
        }}>
          <DomesticTable data={domestic} />
          <ForeignTable data={foreign} />
        </div>
      )}
    </div>
  )
}
