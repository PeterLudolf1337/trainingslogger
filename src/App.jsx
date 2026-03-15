import { useEffect, useMemo, useState } from "react";

// 1. DEIN TRAININGPLAN
const PLAN = {
  Drücken: ["Brustpresse an der Maschine", "Langhantel Bankdrücken (Flachbank)", "Dips mit / ohne Unterstützung", "Schulterdrücken an der Maschine", "Butterfly an der Maschine", "Pushdown am Kabelzug", "Knieheben am Gerät"],
  Ziehen: ["Rudern sitzend am Gerät", "Latziehen zur Brust", "Hyperextensions auf der Bank", "Überzüge am Kabelzug", "Kurzhantel Curls stehend", "Butterfly Reverse am Gerät"],
  Beine: ["Beinstrecken an der Maschine", "Beinbeuger sitzend am Gerät", "Adduktion am Gerät", "45-Grad Beinpresse", "Wadenheben sitzend"]
};

const STORAGE_KEY = "trainingslogger-v8-final";

// 2. HILFSFUNKTIONEN FÜR DIE DROPDOWNS
function emptyArray() { return ["", "", "", ""]; }
const REPS_OPTIONS = Array.from({ length: 21 }, (_, i) => i); // 0-20
const WEIGHT_OPTIONS = Array.from({ length: 81 }, (_, i) => i * 2.5); // 0-200kg in 2,5kg Schritten

export default function App() {
  const [day, setDay] = useState("Drücken");
  const [exercise, setExercise] = useState(PLAN.Drücken[0]);
  const [sets, setSets] = useState(emptyArray());
  const [reps, setReps] = useState(emptyArray());
  const [entries, setEntries] = useState({});
  
  // Responsive Check
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width < 760;

  // Daten laden & speichern
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const history = useMemo(() => {
    return (entries[exercise] || []).slice().reverse();
  }, [entries, exercise]);

  const saveEntry = () => {
    if (![...sets, ...reps].some(val => val !== "" && val !== "0")) return;
    const newEntry = { id: Date.now(), date: new Date().toISOString(), sets: [...sets], reps: [...reps] };
    setEntries({ ...entries, [exercise]: [...(entries[exercise] || []), newEntry] });
    setSets(emptyArray());
    setReps(emptyArray());
  };

  const deleteEntry = (id) => {
    if(window.confirm("Eintrag löschen?")) {
      setEntries({ ...entries, [exercise]: entries[exercise].filter(e => e.id !== id) });
    }
  };

  // STYLES MIT HOHEM KONTRAST
  const styles = {
    page: { minHeight: "100vh", background: "#f5f7fb", padding: isMobile ? "15px" : "30px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    mainTitle: { color: "#000000", fontSize: "34px", fontWeight: "900", marginBottom: "5px", letterSpacing: "-1px" },
    subTitle: { color: "#000000", fontSize: "16px", marginBottom: "20px", fontWeight: "700", opacity: 0.8 },
    card: { background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", marginBottom: "20px" },
    sectionLabel: { color: "#000000", fontWeight: "900", fontSize: "20px", marginBottom: "15px", display: "block" },
    exerciseHeading: { color: "#000000", fontSize: "26px", fontWeight: "900", marginBottom: "10px", lineHeight: "1.2" },
    dropdown: { 
      width: "100%", 
      padding: "14px 10px", 
      borderRadius: "12px", 
      border: "2px solid #d1d5db", 
      background: "#fff", 
      fontSize: "16px", 
      color: "#000000", 
      fontWeight: "600",
      WebkitAppearance: "none" // Verhindert hässliche Standard-Styles auf iOS
    },
    saveBtn: { background: "#000000", color: "#fff", width: "100%", padding: "18px", borderRadius: "14px", border: "none", fontWeight: "800", fontSize: "18px", marginTop: "10px", cursor: "pointer" },
    historyItem: { padding: "15px 0", borderBottom: "1px solid #eee", position: "relative" },
    historyDate: { fontSize: "13px", color: "#4b5563", fontWeight: "700", marginBottom: "4px" },
    historyData: { color: "#000000", fontWeight: "600", fontSize: "15px" },
    deleteIcon: { position: "absolute", right: "0", top: "15px", color: "#ff4444", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }
  };

  return (
    <div style={styles.page}>
      <header>
        <h1 style={styles.mainTitle}>Push-Pull-Beine</h1>
        <p style={styles.subTitle}>Trainingslogger v8</p>
      </header>

      {/* TABS FÜR DIE TAGE */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "25px" }}>
        {Object.keys(PLAN).map(d => (
          <button key={d} onClick={() => {setDay(d); setExercise(PLAN[d][0]);}} 
            style={{ flex: 1, padding: "14px 5px", borderRadius: "12px", border: "none", background: day === d ? "#000000" : "#fff", color: day === d ? "#fff" : "#000000", fontWeight: "800", fontSize: "14px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: "25px" }}>
        
        {/* ÜBUNGSAUSWAHL */}
        <div style={styles.card}>
          <span style={styles.sectionLabel}>Übung wählen</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {PLAN[day].map(ex => (
              <button key={ex} onClick={() => setExercise(ex)} 
                style={{ textAlign: "left", padding: "14px", borderRadius: "12px", border: exercise === ex ? "2px solid #000" : "1px solid #e5e7eb", background: exercise === ex ? "#f8fafc" : "#fff", color: "#000", fontWeight: exercise === ex ? "800" : "500", fontSize: "14px" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* EINGABE & VERLAUF */}
        <div style={styles.card}>
          <h2 style={styles.exerciseHeading}>{exercise}</h2>
          
          <div style={{ marginBottom: "25px" }}>
            {[0, 1, 2, 3].map(index => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ fontWeight: "800", color: "#000", fontSize: "14px" }}>Satz {index + 1}</span>
                
                <select style={styles.dropdown} value={sets[index]} onChange={(e) => { const n = [...sets]; n[index] = e.target.value; setSets(n); }}>
                  <option value="">kg</option>
                  {WEIGHT_OPTIONS.map(v => <option key={v} value={v}>{v} kg</option>)}
                </select>

                <select style={styles.dropdown} value={reps[index]} onChange={(e) => { const n = [...reps]; n[index] = e.target.value; setReps(n); }}>
                  <option value="">Wdh.</option>
                  {REPS_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            ))}
            <button style={styles.saveBtn} onClick={saveEntry}>Eintrag speichern</button>
          </div>

          <span style={styles.sectionLabel}>Verlauf</span>
          {history.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>Noch keine Einträge vorhanden.</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} style={styles.historyItem}>
                <button style={styles.deleteIcon} onClick={() => deleteEntry(entry.id)}>×</button>
                <div style={styles.historyDate}>{new Date(entry.date).toLocaleDateString("de-DE", { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                <div style={styles.historyData}>
                  {entry.sets.map((s, idx) => s ? `S${idx+1}: ${s}kg / ${entry.reps[idx]} ` : null).filter(Boolean).join(" | ")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}