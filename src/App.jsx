import { useEffect, useMemo, useState } from "react";

// --- KONFIGURATION & DATEN ---
const PLAN = {
  Drücken: [
    "Brustpresse an der Maschine",
    "Langhantel Bankdrücken (Flachbank)",
    "Dips mit / ohne Unterstützung",
    "Schulterdrücken an der Maschine",
    "Butterfly an der Maschine",
    "Pushdown am Kabelzug",
    "Knieheben am Gerät",
  ],
  Ziehen: [
    "Rudern sitzend am Gerät",
    "Latziehen zur Brust",
    "Hyperextensions auf der Bank",
    "Überzüge am Kabelzug",
    "Kurzhantel Curls stehend",
    "Butterfly Reverse am Gerät",
  ],
  Beine: [
    "Beinstrecken an der Maschine",
    "Beinbeuger sitzend am Gerät",
    "Adduktion am Gerät",
    "45-Grad Beinpresse",
    "Wadenheben sitzend",
  ],
};

const STORAGE_KEY = "trainingslogger-v6-demo";

// --- HILFSFUNKTIONEN ---
function emptyArray() {
  return ["", "", "", ""];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatEntryText(entry) {
  return entry.sets
    .map((weight, index) => {
      const rep = entry.reps[index];
      if (!weight && !rep) return null;
      const left = weight ? `${weight} kg` : "- kg";
      const right = rep ? `${rep} Wdh.` : "";
      return `S${index + 1}: ${left}${right ? ` · ${right}` : ""}`;
    })
    .filter(Boolean)
    .join("  |  ");
}

// Berechnet das Gesamtvolumen eines Eintrags
function calculateVolume(entry) {
  return entry.sets.reduce((acc, weight, i) => {
    const w = parseFloat(weight) || 0;
    const r = parseFloat(entry.reps[i]) || 0;
    return acc + w * r;
  }, 0);
}

// --- CUSTOM HOOKS ---
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

// --- MINI CHART KOMPONENTE (SVG) ---
function ProgressChart({ data }) {
  if (!data || data.length < 2) return null;

  const width = 300;
  const height = 60;
  const padding = 10;

  const volumes = data.map((d) => d.volume);
  const maxVolume = Math.max(...volumes);
  const minVolume = Math.min(...volumes);
  const range = maxVolume - minVolume || 1;

  const points = data
    .map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.volume - minVolume) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div style={{ marginTop: "16px", marginBottom: "10px" }}>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Volumen-Trend (Gesamt)</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, index) => {
          const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((d.volume - minVolume) / range) * (height - 2 * padding);
          return <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" />;
        })}
      </svg>
    </div>
  );
}

// --- HAUPTAPP ---
export default function App() {
  const [day, setDay] = useState("Drücken");
  const [exercise, setExercise] = useState(PLAN.Drücken[0]);
  const [sets, setSets] = useState(emptyArray());
  const [reps, setReps] = useState(emptyArray());
  const [entries, setEntries] = useState({});
  const [showExerciseList, setShowExerciseList] = useState(true);
  const width = useWindowWidth();
  const isMobile = width < 760;

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        setEntries({});
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const exercises = PLAN[day];

  // History: Chronologisch aufsteigend für das Chart
  const exerciseHistory = useMemo(() => {
    return (entries[exercise] || []).map((entry) => ({
      ...entry,
      volume: calculateVolume(entry),
    }));
  }, [entries, exercise]);

  // Umgekehrte History für die Liste (Neueste oben)
  const historyForDisplay = useMemo(() => {
    return [...exerciseHistory].reverse();
  }, [exerciseHistory]);

  function changeSet(index, value) {
    const next = [...sets];
    next[index] = value;
    setSets(next);
  }

  function changeReps(index, value) {
    const next = [...reps];
    next[index] = value;
    setReps(next);
  }

  function saveEntry() {
    if (![...sets, ...reps].some(Boolean)) return;

    const newEntry = {
      id: Date.now(), // Eindeutige ID zum Löschen
      date: new Date().toISOString(),
      sets: [...sets],
      reps: [...reps],
    };

    const next = {
      ...entries,
      [exercise]: [...(entries[exercise] || []), newEntry],
    };

    setEntries(next);
    setSets(emptyArray());
    setReps(emptyArray());
  }

  function deleteEntry(idToDelete) {
    if (!window.confirm("Eintrag wirklich löschen?")) return;

    const next = {
      ...entries,
      [exercise]: entries[exercise].filter((entry) => entry.id !== idToDelete),
    };
    setEntries(next);
  }

  function useLastEntry() {
    const last = historyForDisplay[0];
    if (!last) return;
    setSets(last.sets || emptyArray());
    setReps(last.reps || emptyArray());
  }

  const styles = {
    // ... (Deine bestehenden Styles bleiben unverändert)
    page: { minHeight: "100vh", background: "#f5f7fb", color: "#111827", fontFamily: "Inter, sans-serif", padding: isMobile ? "14px" : "22px" },
    shell: { maxWidth: "1100px", margin: "0 auto" },
    header: { marginBottom: "18px" },
    title: { margin: 0, fontSize: isMobile ? "28px" : "36px", fontWeight: 800, letterSpacing: "-0.03em" },
    subtitle: { marginTop: "4px", color: "#6b7280", fontSize: "14px", fontWeight: 500 },
    dayTabs: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "18px" },
    dayButton: (active) => ({ border: active ? "2px solid #3b82f6" : "1px solid #d1d5db", background: active ? "#eff6ff" : "#ffffff", color: active ? "#1d4ed8" : "#111827", padding: "12px", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: 700 }),
    mobileActionRow: { display: isMobile ? "flex" : "none", gap: "10px", marginTop: "14px", marginBottom: "14px" },
    mobileActionButton: (active) => ({ flex: 1, border: active ? "1px solid #111827" : "1px solid #d1d5db", background: active ? "#111827" : "#ffffff", color: active ? "#ffffff" : "#111827", borderRadius: "12px", padding: "12px", fontWeight: 700, fontSize: "14px" }),
    grid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr", gap: "18px" },
    card: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "18px", padding: isMobile ? "14px" : "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
    cardTitle: { margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
    exerciseButton: (active) => ({ width: "100%", textAlign: "left", border: "none", background: active ? "#f3f4f6" : "transparent", color: active ? "#111827" : "#4b5563", borderRadius: "10px", padding: "12px", marginBottom: "4px", cursor: "pointer", fontSize: "14px", fontWeight: active ? 700 : 500 }),
    exerciseHeading: { margin: 0, fontSize: isMobile ? "20px" : "24px", fontWeight: 800 },
    topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px", flexDirection: isMobile ? "column" : "row" },
    actionButton: { border: "1px solid #d1d5db", background: "#ffffff", color: "#111827", padding: "8px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 600 },
    setGrid: { display: "grid", gap: "8px", marginBottom: "16px" },
    setRow: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "60px 1fr 1fr", gap: "8px", alignItems: "center" },
    setLabel: { fontSize: "13px", fontWeight: 600, color: "#6b7280" },
    mobileInputs: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
    input: { width: "100%", border: "1px solid #d1d5db", borderRadius: "10px", padding: "10px", fontSize: "14px" },
    saveButton: { border: "none", background: "#3b82f6", color: "#ffffff", padding: "14px", borderRadius: "12px", cursor: "pointer", fontSize: "15px", fontWeight: 700, width: "100%" },
    historyTitle: { margin: "22px 0 10px 0", fontSize: "16px", fontWeight: 700 },
    historyItem: { position: "relative", border: "1px solid #e5e7eb", background: "#f9fafb", borderRadius: "12px", padding: "12px", marginBottom: "8px" },
    historyDate: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" },
    historyText: { fontSize: "13px", fontWeight: 500, color: "#111827", paddingRight: "24px" },
    deleteButton: { position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#9ca3af", fontSize: "18px", cursor: "pointer", padding: "0 4px" },
    empty: { fontSize: "13px", color: "#6b7280", padding: "14px", border: "1px dashed #d1d5db", borderRadius: "12px", textAlign: "center" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <h1 style={styles.title}>Gym Pro</h1>
          <div style={styles.subtitle}>Dein persönlicher Trainingsbegleiter</div>
          <div style={styles.dayTabs}>
            {Object.keys(PLAN).map((planDay) => (
              <button key={planDay} onClick={() => { setDay(planDay); setExercise(PLAN[planDay][0]); setSets(emptyArray()); setReps(emptyArray()); if (isMobile) setShowExerciseList(true); }} style={styles.dayButton(planDay === day)}>
                {planDay}
              </button>
            ))}
          </div>
          <div style={styles.mobileActionRow}>
            <button style={styles.mobileActionButton(showExerciseList)} onClick={() => setShowExerciseList(true)}>Übungen</button>
            <button style={styles.mobileActionButton(!showExerciseList)} onClick={() => setShowExerciseList(false)}>Eintragen</button>
          </div>
        </div>

        <div style={styles.grid}>
          {(!isMobile || showExerciseList) && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Übung wählen</h2>
              {exercises.map((ex) => (
                <button key={ex} onClick={() => { setExercise(ex); setSets(emptyArray()); setReps(emptyArray()); if (isMobile) setShowExerciseList(false); }} style={styles.exerciseButton(ex === exercise)}>
                  {ex}
                </button>
              ))}
            </div>
          )}

          {(!isMobile || !showExerciseList) && (
            <div style={styles.card}>
              <div style={styles.topRow}>
                <h2 style={styles.exerciseHeading}>{exercise}</h2>
                <button style={styles.actionButton} onClick={useLastEntry}>Letzten Eintrag laden</button>
              </div>

              {/* NEU: Das Volumen-Chart */}
              <ProgressChart data={exerciseHistory} />

              <div style={styles.setGrid}>
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} style={styles.setRow}>
                    <div style={styles.setLabel}>Satz {index + 1}</div>
                    <div style={isMobile ? styles.mobileInputs : { display: "contents" }}>
                      <input style={styles.input} type="number" placeholder="kg" value={sets[index]} onChange={(e) => changeSet(index, e.target.value)} />
                      <input style={styles.input} type="number" placeholder="Wdh." value={reps[index]} onChange={(e) => changeReps(index, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <button style={styles.saveButton} onClick={saveEntry}>Trainingseinheit speichern</button>

              <h3 style={styles.historyTitle}>Verlauf</h3>
              {historyForDisplay.length === 0 ? (
                <div style={styles.empty}>Noch keine Daten für diese Übung.</div>
              ) : (
                historyForDisplay.map((entry) => (
                  <div key={entry.id} style={styles.historyItem}>
                    {/* NEU: Löschen Button */}
                    <button style={styles.deleteButton} onClick={() => deleteEntry(entry.id)}>×</button>
                    <div style={styles.historyDate}>{formatDate(entry.date)} — Volumen: {entry.volume.toLocaleString('de-DE')} kg</div>
                    <div style={styles.historyText}>{formatEntryText(entry)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}