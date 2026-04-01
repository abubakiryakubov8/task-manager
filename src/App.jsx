import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useTheme } from "./ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function ProtectedRoute({ user, children }) {
  if (user === null) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const { dark } = useTheme();

  // Apply dark/light class to body
  useEffect(() => {
    document.body.className = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ?? null);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}