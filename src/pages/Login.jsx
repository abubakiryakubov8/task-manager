import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome back</h1>
                <p style={styles.subtitle}>Log in to your account</p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p style={styles.link}>
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
    },
    card: {
        background: "#fff",
        padding: "2.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "400px",
    },
    title: {
        fontSize: "1.8rem",
        fontWeight: "700",
        marginBottom: "0.25rem",
    },
    subtitle: {
        color: "#666",
        marginBottom: "1.5rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "1rem",
        outline: "none",
    },
    button: {
        padding: "0.75rem",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "0.5rem",
    },
    error: {
        color: "#dc2626",
        background: "#fef2f2",
        padding: "0.75rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontSize: "0.9rem",
    },
    link: {
        marginTop: "1.5rem",
        textAlign: "center",
        color: "#666",
        fontSize: "0.9rem",
    },
};