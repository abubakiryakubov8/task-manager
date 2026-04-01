import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const PRIORITIES = ["Low", "Medium", "High"];
const CATEGORIES = ["Work", "Personal", "Shopping", "Health"];

export default function TaskForm({ userId, dark }) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("Work");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const t = dark ? darkTokens : lightTokens;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "tasks"), {
                title: title.trim(),
                userId,
                priority,
                category,
                dueDate: dueDate || null,
                completed: false,
                createdAt: serverTimestamp(),
            });
            setTitle("");
            setDueDate("");
            setPriority("Medium");
            setCategory("Work");
            setExpanded(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ ...styles.wrapper, background: t.cardBg, border: `1px solid ${t.border}` }}>
            <form onSubmit={handleSubmit}>
                <div style={styles.inputRow}>
                    <input
                        style={{ ...styles.input, background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                        type="text"
                        placeholder="Add a task..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setExpanded(true)}
                        disabled={loading}
                    />
                    <button style={{ ...styles.addBtn, background: t.text, color: t.bg }} type="submit" disabled={loading}>
                        {loading ? "..." : "+ Add"}
                    </button>
                </div>

                {expanded && (
                    <div style={styles.options}>
                        <div style={styles.optionGroup}>
                            <label style={{ ...styles.optionLabel, color: t.muted }}>Priority</label>
                            <div style={styles.pills}>
                                {PRIORITIES.map((p) => (
                                    <button key={p} type="button" onClick={() => setPriority(p)}
                                        style={{ ...styles.pill, ...priorityStyle(p, priority === p) }}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.optionGroup}>
                            <label style={{ ...styles.optionLabel, color: t.muted }}>Category</label>
                            <div style={styles.pills}>
                                {CATEGORIES.map((c) => (
                                    <button key={c} type="button" onClick={() => setCategory(c)}
                                        style={{
                                            ...styles.pill,
                                            background: category === c ? t.text : "transparent",
                                            color: category === c ? t.bg : t.muted,
                                            border: `1px solid ${t.border}`,
                                        }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.optionGroup}>
                            <label style={{ ...styles.optionLabel, color: t.muted }}>Due date</label>
                            <input
                                style={{ ...styles.dateInput, border: `1px solid ${t.border}`, color: t.text, background: t.inputBg }}
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

function priorityStyle(level, active) {
    const colors = {
        Low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
        Medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
        High: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };
    const c = colors[level];
    return {
        background: active ? c.bg : "transparent",
        color: active ? c.color : "#999",
        border: `1px solid ${active ? c.border : "#e5e5e5"}`,
        fontWeight: active ? "600" : "400",
    };
}

const lightTokens = { bg: "#fff", text: "#000", muted: "#999", border: "#efefef", cardBg: "#fafafa", inputBg: "#fff" };
const darkTokens = { bg: "#111", text: "#f0f0f0", muted: "#555", border: "#222", cardBg: "#1a1a1a", inputBg: "#111" };

const styles = {
    wrapper: { marginBottom: "1.5rem", borderRadius: "10px", padding: "1rem" },
    inputRow: { display: "flex", gap: "0.75rem" },
    input: { flex: 1, padding: "0.65rem 0.75rem", borderRadius: "6px", fontSize: "0.95rem", outline: "none" },
    addBtn: { padding: "0.65rem 1.25rem", borderRadius: "6px", border: "none", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer" },
    options: { marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.85rem" },
    optionGroup: { display: "flex", alignItems: "center", gap: "0.75rem" },
    optionLabel: { fontSize: "0.8rem", width: "60px", flexShrink: 0 },
    pills: { display: "flex", gap: "0.4rem" },
    pill: { padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.8rem", cursor: "pointer" },
    dateInput: { padding: "0.25rem 0.5rem", borderRadius: "6px", fontSize: "0.85rem", outline: "none" },
};