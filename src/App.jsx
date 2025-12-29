import React, { useEffect, useState, createContext } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

// COMPONENTS
import NavButton from "./components/NavButton";

// AUTH
import Login from "./auth/Login";
import Register from "./auth/Regis";
import Forgot from "./auth/Forgot";

// MAIN PAGES
import Home from "./Home";
import Dashboard from "./Dashboard";
import Screening from "./Screening";
import MoodTracker from "./MoodTracker";
import EducationList from "./EducationList";
import EducationDetail from "./EducationDetail";
import FavoritesList from "./FavoritesList";
import AnonCurhat from "./AnonCurhat";

// CONTEXT
export const AuthContext = createContext(null);

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // ✔ Sekarang aman karena BrowserRouter ada di main.jsx

  // Restore login saat halaman direfresh
  useEffect(() => {
    const saved = localStorage.getItem("mg_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // LOGIN HANDLER
  function login(userObj) {
    setUser(userObj);
    localStorage.setItem("mg_user", JSON.stringify(userObj));

    // ROLE-BASED REDIRECT
    if (userObj.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem("mg_user");
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen bg-gradient-to-tr from-[#8b5cf6] via-[#6366f1] to-[#0ea5e9] flex flex-col items-center py-10">

        {/* HEADER */}
        <header className="w-full max-w-4xl px-6 py-4 bg-white/20 backdrop-blur-xl shadow-lg rounded-2xl border border-white/30 mb-10">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <div>
              <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">MindGenZ</h1>
              <p className="text-white/80 text-sm">Tempat aman untuk cek mood & curhat anonim</p>
            </div>

            {/* NAVIGATION */}
            <nav className="space-x-3 hidden sm:flex items-center">

              {/* Always accessible */}
              <Link to="/"><NavButton>Home</NavButton></Link>
              <Link to="/screening"><NavButton>Screening</NavButton></Link>
              <Link to="/mood"><NavButton>Mood</NavButton></Link>
              <Link to="/edu"><NavButton>Edukasi</NavButton></Link>
              <Link to="/favorites"><NavButton>Favorit</NavButton></Link>
              <Link to="/curhat"><NavButton>Curhat</NavButton></Link>

              {/* ADMIN ONLY */}
              {user?.role === "admin" && (
                <Link to="/dashboard"><NavButton>Dashboard</NavButton></Link>
              )}

              {/* AUTH BUTTONS */}
              {user ? (
                <button 
                  onClick={logout} 
                  className="px-4 py-2 bg-red-500 text-white rounded-xl shadow">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login"><NavButton>Login</NavButton></Link>
                  <Link to="/register"><NavButton>Daftar</NavButton></Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="w-full max-w-4xl px-4">
          <div className="bg-white/70 backdrop-blur-2xl shadow-2xl border border-white/40 rounded-3xl p-8">

            <Routes>

              {/* PUBLIC */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onSuccess={login} />} />
              <Route path="/register" element={<Register goLogin={() => navigate("/login")} />} />
              <Route path="/forgot" element={<Forgot />} />

              {/* FEATURES */}
              <Route path="/screening" element={<Screening />} />
              <Route path="/mood" element={<MoodTracker />} />
              <Route path="/edu" element={<EducationList />} />
              <Route path="/edu/:id" element={<EducationDetail />} />
              <Route path="/favorites" element={<FavoritesList />} />
              <Route path="/curhat" element={<AnonCurhat />} />

              {/* ADMIN PROTECTED ROUTE */}
              <Route
                path="/dashboard"
                element={
                  user?.role === "admin"
                    ? <Dashboard />
                    : <div className="text-center text-red-600 font-bold">
                        Akses ditolak – Anda bukan admin.
                      </div>
                }
              />

            </Routes>

          </div>
        </main>

      </div>
    </AuthContext.Provider>
  );
}
