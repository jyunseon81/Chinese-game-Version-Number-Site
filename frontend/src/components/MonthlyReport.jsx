import { useState, useEffect } from "react"

const OWNER = import.meta.env.VITE_GITHUB_OWNER
const REPO  = import.meta.env.VITE_GITHUB_REPO
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN
const LABEL = "monthly-report"

function parseReport(body) {
  try { return JSON.parse(body) } catch { return null }
}

export default function MonthlyReport({ month }) {
  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const isAuthed = !!TOKEN

  const emptyForm = {
    domestic_total: "",
    domestic_yoy: "",
    foreign_total: "",
    foreign_yoy: "",
    summary: "",
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!month) return
    setLoading(true)
    fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues?labels=${LABEL}&state=open&per_page=100`, {
      headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
    })
      .then(r => r.json())
      .then(issues => {
        if (!Array.isArray(issues)) { setLoading(false); return }
        const found = issues.find(i => i.title === `report:${month}`)
        if (found) {
          const parsed = parseReport(found.body)
          if (parsed) setReport({ ...parsed, issue_number: found.number })
        } else {
          setReport(null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [month])

  function openForm() {
    setForm(report ? {
      domestic_total: report.domestic_total || "",
      domestic_yoy:   report.domestic_yoy   || "",
      foreign_total:  report.foreign_total  || "",
      foreign_yoy:    report.foreign_yoy    || "",
      summary:        report.summary        || "",
    } : emptyForm)
    setShowForm(true)
  }

  async function saveReport() {
    if (!TOKEN) return
    setSaving(true)
    const body = JSON.stringify(form, null, 2)
    try {
      if (report?.issue_number) {
        await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues/${report.issue_number}`, {
          method: "PATCH",
          headers: { Authorization: `token ${TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        })
      } else {
        await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
          method: "POST",
          headers: { Authorization: `token ${TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ title: `report:${month}`, body, labels: [LABEL] }),
        })
      }
      setReport({ ...form })
      setShowForm(false)
    } catch (e) {
      alert("저장 실패: " + e.message)
    }
    setSaving(false)
  }

  if (loading) return null

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #f0f0f0", padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      marginTop: 24,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
          📋 {month} 판호 요약
        </h2>
        {isAuthed && (
          <button
            onClick={() => showForm ? setShowForm(false) : openForm()}
            style={{
              padding: "4px 14px", borderRadius: 8, fontSize: 12,
              border: "1px solid #e8e8e8", background: "#fafafa",
              cursor: "pointer", color: "#555"
            }}>
            {showForm ? "취소" : report ? "수정" : "작성"}
          </button>
        )}
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <div style={{ marginBottom: 20 }}>
          {/* 총계 입력 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 10, marginBottom: 14 }}>
            {[
              { key: "domestic_total", label: "내자 총계" },
              { key: "domestic_yoy",   label: "내자 YoY" },
              { key: "foreign_total",  label: "외자 총계" },
              { key: "foreign_yoy",    label: "외자 YoY" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, color: "#888",
                  display: "block", marginBottom: 4 }}>{f.label}</label>
                <input
                  value={form[f.key]}
                  placeholder={f.key.includes("yoy") ? "예: ▲36" : "예: 146"}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box",
                    padding: "6px 10px", borderRadius: 6,
                    border: "1px solid #e8e8e8", fontSize: 13 }}
                />
              </div>
            ))}
          </div>

          {/* 자유 텍스트 요약 */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#888",
              display: "block", marginBottom: 4 }}>
              상세 내용 (파트너사, 메이저 게임사, 한국 IP 등 자유 작성)
            </label>
            <textarea
              value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
              rows={10}
              placeholder={`예시:\n\n당사 파트너사\n- 37후위 (3종): <투라대륙: 전승> (모바일), <퍼리 컴퍼니> (PC), <소완웅백장전2> (모바일)\n\n메이저 게임사\n- 텐센트 (1종): <설중한도행지세자다교> (모바일)\n- 4399 (3종): <조몽비경> (모바일/웹), <벨벳 발톱 작전> (모바일), <초토지상> (모바일)\n\n한국 IP 판호\n- 없음`}
              style={{ width: "100%", boxSizing: "border-box",
                padding: "8px 12px", borderRadius: 6,
                border: "1px solid #e8e8e8", fontSize: 13,
                lineHeight: 1.7, resize: "vertical" }}
            />
          </div>

          <button onClick={saveReport} disabled={saving}
            style={{
              padding: "8px 24px", borderRadius: 8, fontSize: 13,
              background: "#1a73e8", color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1, fontWeight: 600,
            }}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      )}

      {/* 리포트 표시 */}
      {report && !showForm && (
        <div>
          {/* 총계 카드 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>내자 판호</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1a73e8" }}>
                {report.domestic_total}종
              </div>
              {report.domestic_yoy && (
                <div style={{
                  fontSize: 12, marginTop: 2,
                  color: report.domestic_yoy.includes("▲") ? "#52c41a" : "#f5222d"
                }}>
                  YoY {report.domestic_yoy}
                </div>
              )}
            </div>
            <div style={{ background: "#fff7e6", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>외자 판호</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fa8c16" }}>
                {report.foreign_total}종
              </div>
              {report.foreign_yoy && (
                <div style={{
                  fontSize: 12, marginTop: 2,
                  color: report.foreign_yoy.includes("▲") ? "#52c41a" : "#f5222d"
                }}>
                  YoY {report.foreign_yoy}
                </div>
              )}
            </div>
          </div>

          {/* 상세 내용 */}
          {report.summary && (
            <div style={{
              background: "#fafafa", borderRadius: 8,
              padding: "14px 16px", fontSize: 13,
              color: "#444", lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}>
              {report.summary}
            </div>
          )}
        </div>
      )}

      {!report && !showForm && (
        <p style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "16px 0" }}>
          {isAuthed ? "작성 버튼을 눌러 이번 달 요약을 작성해주세요" : "이번 달 요약이 없습니다"}
        </p>
      )}
    </div>
  )
}
