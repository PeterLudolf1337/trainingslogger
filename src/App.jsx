import { useEffect, useMemo, useState } from "react";

const PLAN = {
  Drücken: [
    "Brustpresse an der Maschine",
    "Langhantel Bankdrücken (Flachbank)",
    "Dips mit / ohne Unterstützung",
    "Schulterdrücken an der Maschine",
    "Butterfly an der Maschine",
    "Pushdown am Kabelzug",
    "Knieheben am Gerät",
    "Optional: Seitliches Oberkörperbeugen bzw. Kombi aus beiden Bauchübungen",
  ],
  Ziehen: [
    "Rudern sitzend am Gerät",
    "Latziehen zur Brust",
    "Hyperextensions auf der Bank",
    "Überzüge am Kabelzug",
    "Kurzhantel Curls stehend",
    "Butterfly Reverse am Gerät",
    "Klimmzüge mit / ohne Unterstützung",
  ],
  Beine: [
    "Beinstrecken an der Maschine",
    "Beinbeuger sitzend am Gerät",
    "Adduktion am Gerät",
    "45-Grad Beinpresse",
    "Wadenheben sitzend",
    "Bulgarian Split Squats",
    "Negative Sit-Ups",
    "Optional: Seitliches Oberkörperbeugen bzw. Kombi aus beiden Bauchübungen",
  ],
};

const STORAGE_KEY = "trainingslogger-v5";

function emptyArray() {
  return ["", "", "", ""];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatEntry(entry) {
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

export default function App() {
  const [day, setDay] = useState("Drücken");
  const [exercise, setExercise] = useState(PLAN.Drücken[0]);
  const [sets, setSets] = useState(emptyArray());
  const [reps, setReps] = useState(emptyArray());
  const [entries, setEntries] = useState({});
  const [showExerciseList, setShowExerciseList] = useState(true);
  const width = useWindowWidth();
  const isMobile = width < 760;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const exercises = PLAN[day];

  const history = useMemo(() => {
    return (entries[exercise] || []).slice().reverse();
  }, [entries, exercise]);

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

  function useLastEntry() {
    const last = history[0];
    if (!last) return;
    setSets(last.sets || emptyArray());
    setReps(last.reps || emptyArray());
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fb",
      color: "#111827",
      fontFamily: "Inter, Arial, sans-serif",
      padding: isMobile ? "14px" : "22px",
    },
    shell: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "18px",
    },
    title: {
      margin: 0,
      fontSize: isMobile ? "30px" : "40px",
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    subtitle: {
      marginTop: "8px",
      color: "#6b7280",
      fontSize: isMobile ? "14px" : "15px",
      lineHeight: 1.4,
    },
    dayTabs: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, max-content)",
      gap: "10px",
      marginTop: "18px",
    },
    dayButton: (active) => ({
      border: active ? "1px solid #111827" : "1px solid #d1d5db",
      background: active ? "#111827" : "#ffffff",
      color: active ? "#ffffff" : "#111827",
      padding: isMobile ? "13px 10px" : "12px 18px",
      borderRadius: "14px",
      cursor: "pointer",
      fontSize: isMobile ? "14px" : "15px",
      fontWeight: 700,
      width: "100%",
    }),
    mobileActionRow: {
      display: isMobile ? "flex" : "none",
      gap: "10px",
      marginTop: "14px",
      marginBottom: "14px",
    },
    mobileActionButton: (active) => ({
      flex: 1,
      border: active ? "1px solid #111827" : "1px solid #d1d5db",
      background: active ? "#111827" : "#ffffff",
      color: active ? "#ffffff" : "#111827",
      borderRadius: "14px",
      padding: "12px",
      fontWeight: 700,
      fontSize: "14px",
      cursor: "pointer",
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 360px) minmax(0, 1fr)",
      gap: "18px",
      alignItems: "start",
    },
    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: isMobile ? "18px" : "22px",
      padding: isMobile ? "14px" : "18px",
      boxShadow: "0 8px 30px rgba(17,24,39,0.05)",
    },
    cardTitle: {
      margin: "0 0 14px 0",
      fontSize: isMobile ? "17px" : "18px",
      fontWeight: 700,
    },
    exerciseButton: (active) => ({
      width: "100%",
      textAlign: "left",
      border: active ? "1px solid #111827" : "1px solid #e5e7eb",
      background: active ? "#111827" : "#ffffff",
      color: active ? "#ffffff" : "#111827",
      borderRadius: "16px",
      padding: isMobile ? "13px" : "14px",
      marginBottom: "10px",
      cursor: "pointer",
      fontSize: isMobile ? "14px" : "14px",
      lineHeight: 1.35,
      fontWeight: 500,
    }),
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "16px",
      flexDirection: isMobile ? "column" : "row",
    },
    actionButton: {
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#111827",
      padding: "11px 14px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 700,
      width: isMobile ? "100%" : "auto",
    },
    saveButton: {
      border: "none",
      background: "#111827",
      color: "#ffffff",
      padding: isMobile ? "16px 18px" : "14px 18px",
      borderRadius: "14px",
      cursor: "pointer",
      fontSize: isMobile ? "16px" : "15px",
      fontWeight: 800,
      width: "100%",
      marginTop: "10px",
    },
    exerciseHeading: {
      margin: 0,
      fontSize: isMobile ? "22px" : "26px",
      fontWeight: 800,
      lineHeight: 1.2,
    },
    muted: {
      color: "#6b7280",
      fontSize: "14px",
      marginTop: "6px",
      lineHeight: 1.4,
    },
    setGrid: {
      display: "grid",
      gap: "12px",
      marginBottom: "18px",
    },
    setRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "90px 1fr 1fr",
      gap: "10px",
      alignItems: "center",
      padding: isMobile ? "12px" : "0",
      border: isMobile ? "1px solid #eef2f7" : "none",
      borderRadius: isMobile ? "14px" : "0",
      background: isMobile ? "#fafbfc" : "transparent",
    },
    setLabel: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#374151",
    },
    mobileInputs: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      padding: isMobile ? "14px 12px" : "12px 12px",
      fontSize: "14px",
      background: "#ffffff",
    },
    historyTitle: {
      margin: "26px 0 12px 0",
      fontSize: isMobile ? "17px" : "18px",
      fontWeight: 700,
    },
    historyItem: {
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      borderRadius: "16px",
      padding: "14px",
      marginBottom: "10px",
    },
    historyDate: {
      fontSize: "13px",
      color: "#6b7280",
      marginBottom: "6px",
    },
    historyText: {
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    empty: {
      fontSize: "14px",
      color: "#6b7280",
      padding: "14px",
      border: "1px dashed #d1d5db",
      borderRadius: "16px",
      background: "#f9fafb",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <h1 style={styles.title}>Trainingslogger</h1>
          <div style={styles.subtitle}>Schlicht, schnell und direkt für dein Push-Pull-Beine-Training.</div>
          <div style={styles.dayTabs}>
            {Object.keys(PLAN).map((planDay) => (
              <button
                key={planDay}
                onClick={() => {
                  setDay(planDay);
                  setExercise(PLAN[planDay][0]);
                  setSets(emptyArray());
                  setReps(emptyArray());
                  if (isMobile) setShowExerciseList(true);
                }}
                style={styles.dayButton(planDay === day)}
              >
                {planDay}
              </button>
            ))}
          </div>

          <div style={styles.mobileActionRow}>
            <button
              style={styles.mobileActionButton(showExerciseList)}
              onClick={() => setShowExerciseList(true)}
            >
              Übungen
            </button>
            <button
              style={styles.mobileActionButton(!showExerciseList)}
              onClick={() => setShowExerciseList(false)}
            >
              Eintragen
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {(!isMobile || showExerciseList) && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Übungen</h2>
              {exercises.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setExercise(ex);
                    setSets(emptyArray());
                    setReps(emptyArray());
                    if (isMobile) setShowExerciseList(false);
                  }}
                  style={styles.exerciseButton(ex === exercise)}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {(!isMobile || !showExerciseList) && (
            <div style={styles.card}>
              <div style={styles.topRow}>
                <div>
                  <h2 style={styles.exerciseHeading}>{exercise}</h2>
                  <div style={styles.muted}>Bis zu 4 Sätze mit Gewicht und Wiederholungen speichern.</div>
                </div>
                <button style={styles.actionButton} onClick={useLastEntry}>
                  Letzten Eintrag übernehmen
                </button>
              </div>

              <div style={styles.setGrid}>
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} style={styles.setRow}>
                    <div style={styles.setLabel}>Satz {index + 1}</div>
                    {isMobile ? (
                      <div style={styles.mobileInputs}>
                        <input
                          style={styles.input}
                          placeholder="Gewicht (kg)"
                          value={sets[index]}
                          onChange={(e) => changeSet(index, e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder="Wiederholungen"
                          value={reps[index]}
                          onChange={(e) => changeReps(index, e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <input
                          style={styles.input}
                          placeholder="Gewicht (kg)"
                          value={sets[index]}
                          onChange={(e) => changeSet(index, e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder="Wiederholungen"
                          value={reps[index]}
                          onChange={(e) => changeReps(index, e.target.value)}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button style={styles.saveButton} onClick={saveEntry}>
                Speichern
              </button>

              <h3 style={styles.historyTitle}>Verlauf</h3>
              {history.length === 0 ? (
                <div style={styles.empty}>Noch kein Eintrag gespeichert.</div>
              ) : (
                history.map((entry, index) => (
                  <div key={index} style={styles.historyItem}>
                    <div style={styles.historyDate}>{formatDate(entry.date)}</div>
                    <div style={styles.historyText}>{formatEntry(entry)}</div>
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
