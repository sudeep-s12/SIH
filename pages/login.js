import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box, Button, TextField, Typography, MenuItem, Select, InputLabel,
  FormControl, Paper, ToggleButton, ToggleButtonGroup, Avatar,
  CircularProgress, Snackbar, Alert
} from "@mui/material";
import { supabase } from "../src/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ngo");
  const [name, setName] = useState("");

  // Util: Fetch profile with retries (in case DB is slow after signup)
  async function fetchProfileWithRetry(userId, maxRetries = 6, delayMs = 400) {
    for (let i = 0; i < maxRetries; i++) {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (profile && profile.role) return profile;
      await new Promise(res => setTimeout(res, delayMs));
    }
    return null;
  }

  async function handleLogin(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data.user;

      // Robust: Wait for profile to become available
      const profile = await fetchProfileWithRetry(user.id);
      if (!profile) {
        setSnack({ open: true, severity: "warning", message: "Profile missing or delayed. Please try login again in a moment, or contact admin." });
        setLoading(false);
        return;
      }
      const userRole = (profile.role || "").toLowerCase();
      if (userRole === "admin") router.replace("/admin");
      else if (userRole === "ngo") router.replace("/ngo");
      else if (userRole === "temple") router.replace("/temple");
      else {
        setSnack({ open: true, severity: "warning", message: "No valid role on profile. Contact admin." });
      }
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err.message || "Login failed" });
    } finally { setLoading(false); }
  }

  async function handleSignup(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // May require user to confirm email first! (see your Supabase settings)
      const user = data.user;
      if (!user) {
        setSnack({ open: true, severity: "info", message: "Signup OK — check your email to confirm, then login." });
        setLoading(false);
        return;
      }

      // Insert profile after signup
      const roleLower = role.toLowerCase();
      const { error: insertErr } = await supabase.from("profiles").insert([{
        id: user.id,
        email,
        role: roleLower,
        full_name: name || null,
        created_at: new Date().toISOString()
      }]);
      if (insertErr) throw insertErr;
      setSnack({ open: true, severity: "success", message: "Account created! Logging in..." });

      // Wait until profile is visible, then redirect
      const profile = await fetchProfileWithRetry(user.id);
      if (!profile) {
        setSnack({ open: true, severity: "warning", message: "Signup OK but slow. Please try login in a moment." });
        setLoading(false);
        return;
      }

      if (roleLower === "admin") router.replace("/admin");
      else if (roleLower === "ngo") router.replace("/ngo");
      else router.replace("/temple/index.js");
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err.message || "Signup failed" });
    } finally { setLoading(false); }
  }

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 20% 30%, rgba(140,255,140,0.12), transparent 60%), radial-gradient(circle at 80% 20%, rgba(90,200,90,0.08), transparent 70%), linear-gradient(135deg,#174f44,#0f3e36 60%)`, px: 2
    }}>
      <Paper elevation={12} sx={{ width: "100%", maxWidth: 540, p: 4, borderRadius: 3, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
        <Avatar src="/logo.jpeg" sx={{ width: 90, height: 90, margin: "0 auto", mb: 1, borderRadius: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#c8f7da" }}>Seva Sanjeevani</Typography>
        <Typography sx={{ color: "#e6ffee", mb: 2 }}>{mode === "login" ? "Welcome Back — Please Login" : "Create Account"}</Typography>
        <ToggleButtonGroup value={mode} exclusive onChange={(e, v) => v && setMode(v)} sx={{
          bgcolor: "rgba(255,255,255,0.06)", borderRadius: 2, mb: 2,
          ".MuiToggleButton-root": { color: "#e6ffee" }, ".Mui-selected": { bgcolor: "rgba(255,140,0,0.12)" }
        }}>
          <ToggleButton value="login">LOGIN</ToggleButton>
          <ToggleButton value="signup">SIGN UP</ToggleButton>
        </ToggleButtonGroup>
        <Box component="form" onSubmit={mode === "login" ? handleLogin : handleSignup}>
          {mode === "signup" && (
            <TextField placeholder="Full name (optional)" value={name} onChange={e => setName(e.target.value)} fullWidth sx={{ mb: 1.5, background: "rgba(255,255,255,0.06)" }} />
          )}
          <TextField placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} type="email" required fullWidth sx={{ mb: 1.5, background: "rgba(255,255,255,0.06)" }} />
          <TextField placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} type="password" required fullWidth sx={{ mb: 1.5, background: "rgba(255,255,255,0.06)" }} />
          {mode === "signup" && (
            <FormControl fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ color: "#e6ffee" }}>Role</InputLabel>
              <Select value={role} label="Role" onChange={e => setRole(e.target.value)} sx={{ background: "rgba(255,255,255,0.06)" }}>
                <MenuItem value="ngo">NGO</MenuItem>
                <MenuItem value="temple">Temple</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button fullWidth variant="contained" disabled={loading} sx={{ mt: 2, bgcolor: "#ff8c00", "&:hover": { bgcolor: "#ff7a00" }, py: 1.6, fontWeight: 700 }} type="submit">
            {loading ? <CircularProgress size={22} color="inherit" /> : (mode === "login" ? "LOGIN" : "CREATE ACCOUNT")}
          </Button>
        </Box>
        <Button onClick={() => setMode(mode === "login" ? "signup" : "login")} sx={{ mt: 2, color: "#dfffe6" }}>
          {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </Button>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
