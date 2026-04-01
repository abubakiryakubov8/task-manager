import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const PRIORITY_BADGE = {
    High: { background: "#fef2f2", color: "#dc2626" },
    Medium: { background: "#fffbeb", color: "#d97706" },
    Low: { background: "#f0fdf4", color: "#16a34a" },
};

export default function TaskList({ tasks, dark }) {
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const t = dark ? darkTokens : lightTokens;

    async function handleDelete(id) {
        await deleteDoc(doc(db, "tasks", id));
    }

    async function handleToggle(task) {
        await updateDoc(doc(db, "tasks", task.id), { completed: !task.completed });
    }

    function startEdit(task) {
        setEditingId(task.id);
        setEditingTitle(task.title);
    }

    async function handleUpdate(id) {
        if (!editingTitle.trim()) return;
        await updateDoc(doc(db, "tasks", id), { title: editingTitle.trim() });
        setEditingId(null);
    }

    function formatDate(dateStr) {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    function isOverdue(dateStr) {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    }

    if (tasks.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "3rem", color: t.muted, fontSize: "0.9rem" }}>
                No tasks here yet.
            </div>
        );
    }

    return (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
            {tasks.map((task) => (
                <li key={task.id} style={{ ...styles.item, borderBottom: `1px solid ${t.border}` }}>

                    {/* Checkbox */}
                    <div
                        style={{
                            ...styles.circle,
                            background: task.completed ? t.text : "transparent",
                            borderColor: task.completed ? t.text : t.border,
                        }}
                        onClick={() => handleToggle(task)}
                    >
                        {task.completed && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L4 7L9 1" stroke={t.bg} strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {editingId === task.id ? (
                            <input
                                style={{ ...styles.editInput, border: `1px solid ${t.border}`, color: t.text, background: t.inputBg }}
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleUpdate(task.id)}
                                autoFocus
                            />
                        ) : (
                            <span style={{
                                ...styles.taskTitle,
                                textDecoration: task.completed ? "line-through" : "none",
                                color: task.completed ? t.muted : t.text,
                            }}>
                                {task.title}
                            </span>
                        )}

                        <div style={styles.meta}>
                            {task.priority && (
                                <span style={{ ...styles.badge, ...PRIORITY_BADGE[task.priority] }}>
                                    {task.priority}
                                </span>
                            )}
                            {task.category && (
                                <span style={{ ...styles.category, background: t.tagBg, color: t.muted }}>
                                    {task.category}
                                </span>
                            )}
                            {task.dueDate && (
                                <span style={{
                                    ...styles.dueDate,
                                    color: isOverdue(task.dueDate) && !task.completed ? "#dc2626" : t.muted,
                                }}>
                                    📅 {formatDate(task.dueDate)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        {editingId === task.id ? (
                            <>
                                <button style={{ ...styles.saveBtn, background: t.text, color: t.bg }} onClick={() => handleUpdate(task.id)}>Save</button>
                                <button style={{ ...styles.cancelBtn, border: `1px solid ${t.border}`, color: t.muted }} onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button style={{ ...styles.actionBtn, color: t.muted }} onClick={() => startEdit(task)}>Edit</button>
                                <button style={{ ...styles.actionBtn, color: "#dc2626" }} onClick={() => handleDelete(task.id)}>Delete</button>
                            </>
                        )}
                    </div>

                </li>
            ))}
        </ul>
    );
}

const lightTokens = { bg: "#fff", text: "#000", muted: "#999", border: "#f0f0f0", inputBg: "#fff", tagBg: "#f5f5f5" };
const darkTokens = { bg: "#111", text: "#f0f0f0", muted: "#555", border: "#222", inputBg: "#1a1a1a", tagBg: "#1a1a1a" };

const styles = {
    item: { display: "flex", alignItems: "flex-start", gap: "0.85rem", padding: "0.9rem 0" },
    circle: {
        width: "20px", height: "20px", borderRadius: "50%", border: "1.5px solid",
        cursor: "pointer", flexShrink: 0, marginTop: "2px",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease",
    },
    content: { flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" },
    taskTitle: { fontSize: "0.95rem", lineHeight: "1.4" },
    meta: { display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" },
    badge: { fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "99px", fontWeight: "600" },
    category: { fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "99px" },
    dueDate: { fontSize: "0.75rem" },
    editInput: { padding: "0.3rem 0.5rem", borderRadius: "4px", fontSize: "0.95rem", outline: "none", width: "100%" },
    actions: { display: "flex", gap: "0.25rem", flexShrink: 0 },
    actionBtn: { padding: "0.25rem 0.6rem", borderRadius: "5px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.8rem" },
    saveBtn: { padding: "0.25rem 0.6rem", borderRadius: "5px", border: "none", cursor: "pointer", fontSize: "0.8rem" },
    cancelBtn: { padding: "0.25rem 0.6rem", borderRadius: "5px", background: "transparent", cursor: "pointer", fontSize: "0.8rem" },
};