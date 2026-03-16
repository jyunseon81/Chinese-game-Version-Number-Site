export default function MonthTabs({ months, selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {months.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: "6px 16px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: selected === m ? "#1a73e8" : "#ddd",
            background: selected === m ? "#1a73e8" : "#fff",
            color: selected === m ? "#fff" : "#555",
            fontWeight: selected === m ? 600 : 400,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {m}
        </button>
      ))}
    </div>
  )
}
