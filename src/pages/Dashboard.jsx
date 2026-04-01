import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

const CATEGORIES = ["All", "Work", "Personal", "Shopping", "Health"];

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { dark, toggleTheme } = useTheme();

    const t = dark ? darkTokens : lightTokens;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) navigate("/");
            else setUser(currentUser);
        });
        return unsubscribe;
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return b.createdAt.seconds - a.createdAt.seconds;
                });
            setTasks(fetched);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    async function handleLogout() {
        await signOut(auth);
        navigate("/");
    }

    const filtered = tasks
        .filter((t) => filter === "All" || t.category === filter)
        .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

    const completed = tasks.filter((t) => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

    if (!user) return null;

    return (
        <div style={{ ...styles.page, background: t.bg }}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={{ ...styles.title, color: t.text }}>My Tasks</h1>
                        <p style={{ ...styles.subtitle, color: t.muted }}>{user.email}</p>
                    </div>
                    <div style={styles.headerActions}>
                        {/* Theme Toggle */}
                        <button style={{ ...styles.iconBtn, color: t.muted, border: `1px solid ${t.border}` }} onClick={toggleTheme}>
                            {dark ? "☀️" : "🌙"}
                        </button>
                        <button style={{ ...styles.logoutBtn, color: t.muted, border: `1px solid ${t.border}` }} onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div style={styles.progressWrapper}>
                    <div style={styles.progressHeader}>
                        <span style={{ fontSize: "0.85rem", color: t.muted }}>
                            {completed} of {tasks.length} complete
                        </span>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: t.text }}>
                            {progress}%
                        </span>
                    </div>
                    <div style={{ ...styles.progressTrack, background: t.trackBg }}>
                        <div style={{ ...styles.progressFill, width: `${progress}%`, background: t.text }} />
                    </div>
                </div>

                {/* Search */}
                <input
                    style={{
                        ...styles.search,
                        background: t.inputBg,
                        border: `1px solid ${t.border}`,
                        color: t.text,
                    }}
                    type="text"
                    placeholder="🔍  Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Task Form */}
                <TaskForm userId={user.uid} dark={dark} />

                {/* Filters */}
                <div style={styles.filters}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                ...styles.filterBtn,
                                background: filter === cat ? t.text : "transparent",
                                color: filter === cat ? t.bg : t.muted,
                                border: `1px solid ${t.border}`,
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                {loading ? (
                    <p style={{ color: t.muted, textAlign: "center", padding: "2rem" }}>Loading...</p>
                ) : (
                    <TaskList tasks={filtered} dark={dark} />
                )}

            </div>
        </div>
    );
}

const lightTokens = {
    bg: "#fff",
    text: "#000",
    muted: "#999",
    border: "#efefef",
    inputBg: "#fafafa",
    trackBg: "#f0f0f0",
};

const darkTokens = {
    bg: "#111",
    text: "#f0f0f0",
    muted: "#555",
    border: "#222",
    inputBg: "#1a1a1a",
    trackBg: "#222",
};

const styles = {
    page: {
        minHeight: "100vh",
        padding: "3rem 1rem",
        transition: "background 0.2s ease",
    },
    container: { maxWidth: "680px", margin: "0 auto" },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "2.5rem",
    },
    headerActions: { display: "flex", gap: "0.5rem", alignItems: "center" },
    title: { fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.5px" },
    subtitle: { fontSize: "0.85rem", marginTop: "0.25rem" },
    iconBtn: {
        padding: "0.4rem 0.75rem",
        borderRadius: "6px",
        background: "transparent",
        cursor: "pointer",
        fontSize: "1rem",
    },
    logoutBtn: {
        padding: "0.4rem 1rem",
        borderRadius: "6px",
        background: "transparent",
        cursor: "pointer",
        fontSize: "0.85rem",
    },
    progressWrapper: { marginBottom: "1.5rem" },
    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "0.5rem",
    },
    progressTrack: { height: "4px", borderRadius: "99px", overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: "99px", transition: "width 0.4s ease" },
    search: {
        width: "100%",
        padding: "0.65rem 1rem",
        borderRadius: "8px",
        fontSize: "0.9rem",
        outline: "none",
        marginBottom: "1.25rem",
    },
    filters: {
        display: "flex",
        gap: "0.4rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
    },
    filterBtn: {
        padding: "0.3rem 0.85rem",
        borderRadius: "99px",
        cursor: "pointer",
        fontSize: "0.8rem",
        fontWeight: "500",
    },
};