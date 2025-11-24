import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/lib/supabaseClient";

// -----------------------------------------------------------------------------
// pages/index.js  - Login / Signup with Google OAuth, Forgot Password, loading
// -----------------------------------------------------------------------------
export default function Home() {
  const [variant, setVariant] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ngo");
  const [feedback, setFeedback] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 150);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
    setLoading(true);

    if (variant === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        return setFeedback(error.message);
      }

      const user = data.user;
      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          { id: user.id, email, role },
        ]);

        setLoading(false);
        if (profileError) setFeedback(profileError.message);
        else setFeedback("Signup successful! Verify your email.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return setFeedback(error.message);
      }

      const user = data.user;
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setLoading(false);
        if (profileError) setFeedback(profileError.message);
        else {
          setFeedback(`Login successful! Logged in as: ${profile.role}`);
          // Role-based redirect: will navigate to /ngo, /admin or /temple
          setTimeout(() => router.push(`/${profile.role}`), 1000);
        }
      }
    }
  };

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return setFeedback("Enter an email to reset.");

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (error) setFeedback(error.message);
    else {
      setFeedback("Password reset link sent! Check your email.");
      setShowReset(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "radial-gradient(circle at top, #fff7d1, #4b3e06)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Main Card */}
      <div
        ref={cardRef}
        style={{
          width: "92%",
          maxWidth: 520,
          padding: 40,
          borderRadius: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          textAlign: "center",
          transform: fadeIn ? "translateY(0) scale(1)" : "translateY(40px) scale(0.98)",
          opacity: fadeIn ? 1 : 0,
          transition: "all .6s cubic-bezier(.2,.9,.2,1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div style={{ position: "absolute", right: -80, top: -80, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,#fff8d6, rgba(196,149,0,0.08))", filter: "blur(30px)", pointerEvents: "none" }} />

        <h1 style={{ color: "#6b5200", fontWeight: 900, margin: 0 }}>INVENTORY MANAGEMENT</h1>
        <h2 style={{ background: "linear-gradient(90deg,#c39600,#fff4b5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, marginTop: 6 }}>
          SEVA SANJEEVEANI
        </h2>

        <div style={{ marginBottom: 18, marginTop: 18, display: "flex", justifyContent: "center" }}>
          <button onClick={() => setVariant("login")} disabled={variant === "login"} style={tabBtn(variant === "login")}>
            Login
          </button>
          <button onClick={() => setVariant("signup")} disabled={variant === "signup"} style={tabBtn(variant === "signup")}>
            Sign Up
          </button>
          <button onClick={handleGoogleAuth} style={tabBtn(false)}>
            Continue with Google
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ maxWidth: 420, margin: "0 auto" }}>
          <input type="email" placeholder="Email" required style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />

          <select value={role} disabled={variant === "login"} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, fontWeight: 600 }}>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
            <option value="temple">Temple</option>
          </select>

          <button type="submit" style={{ ...submitBtn, opacity: loading ? 0.9 : 1 }} disabled={loading}>
            {loading ? "Processing..." : variant === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {variant === "login" && (
          <p style={{ marginTop: 10, cursor: "pointer", color: "#5c3d00" }} onClick={() => setShowReset(true)}>
            Forgot Password?
          </p>
        )}

        {feedback && (
          <p style={{ color: feedback.includes("successful") ? "#008c2c" : "#c10000", marginTop: 16, fontWeight: 600 }}>{feedback}</p>
        )}
      </div>

      {/* RESET PASSWORD MODAL */}
      {showReset && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 40 }}>
          <div style={{ padding: 26, background: "white", borderRadius: 14, width: 360, textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontWeight: 700, marginTop: 0 }}>Reset Password</h3>
            <input type="email" placeholder="Enter email" style={inputStyle} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            <button onClick={handlePasswordReset} style={submitBtn}>Send Reset Link</button>
            <p style={{ marginTop: 10, cursor: "pointer" }} onClick={() => setShowReset(false)}>Close</p>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------
const tabBtn = (active) => ({
  background: active ? "#fff4c0" : "transparent",
  color: active ? "#000" : "#6b5200",
  padding: "8px 18px",
  borderRadius: 10,
  border: "2px solid #6b5200",
  marginRight: 8,
  fontWeight: 700,
  cursor: active ? "default" : "pointer",
  transition: "all .18s ease",
});

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "2px solid #d6c78a",
  background: "rgba(255,255,255,0.96)",
  marginBottom: 14,
  fontSize: 15,
  outline: "none",
};

const submitBtn = {
  marginTop: 10,
  width: "100%",
  padding: "12px 0",
  background: "linear-gradient(90deg,#6b5200,#a3872a)",
  border: "none",
  borderRadius: 12,
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0px 6px 20px rgba(163,129,42,0.18)",
};

// -----------------------------------------------------------------------------
// DASHBOARD SAMPLES
// Save each block as its own file under /pages (examples below).
// -----------------------------------------------------------------------------

/*
// pages/ngo.js  (Minimal Clean Dashboard - white + gold)
import React from 'react';
export default function NGODashboard() {
  return (
    <div style={{ padding: 28, fontFamily: 'Poppins, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#6b5200' }}>NGO Dashboard</h1>
        <div style={{ color: '#a3862a', fontWeight: 700 }}>Seva Sanjeevani</div>
      </header>

      <section style={{ marginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          <Card title="Inventory" value="1,234" />
          <Card title="Requests" value="42" />
          <Card title="Active Programs" value="8" />
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ padding: 18, borderRadius: 12, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
      <div style={{ color: '#8b6b00', fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>{value}</div>
    </div>
  );
}
*/

/*
// pages/admin.js (Modern Animated Dashboard)
import React from 'react';
export default function AdminPanel() {
  return (
    <div style={{ padding: 28, fontFamily: 'Poppins, sans-serif', background: '#f7f7f9', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#333' }}>Admin Panel</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '8px 12px', borderRadius: 8 }}>Settings</button>
          <button style={{ padding: '8px 12px', borderRadius: 8 }}>Users</button>
        </div>
      </header>

      <main style={{ marginTop: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <h3>Overview</h3>
            <p>Charts and realtime metrics go here.</p>
          </div>

          <div style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <h3>Quick Actions</h3>
            <button style={{ marginTop: 8 }}>Add Item</button>
          </div>
        </div>
      </main>
    </div>
  );
}
*/

/*
// pages/temple.js (Temple-style theme - saffron + motifs)
import React from 'react';
export default function TempleDashboard() {
  return (
    <div style={{ padding: 28, fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(180deg,#fff8eb,#fff2e0)', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#b85b00' }}>Temple Dashboard</h1>
        <div style={{ color: '#b85b00', fontWeight: 700 }}>Seva</div>
      </header>

      <main style={{ marginTop: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 12 }}>
            <h4>Donations</h4>
            <div style={{ fontSize: 20, fontWeight: 800 }}>₹ 1,23,456</div>
          </div>

          <div style={{ background: '#fff', padding: 18, borderRadius: 12 }}>
            <h4>Events</h4>
            <div>5 upcoming</div>
          </div>
        </div>
      </main>
    </div>
  );
}
*/

// -----------------------------
// Notes
// -----------------------------
// 1) Save each commented block as its own file under /pages (ngo.js, admin.js, temple.js).
// 2) The login redirects to /ngo, /admin, /temple based on the "role" value in profiles table.
// 3) Make sure your Supabase project has the "profiles" table with (id PRIMARY KEY, email, role).
// 4) If you want, I can split these into separate canvas files and provide full starter implementations (charts, tables).

// End of file
