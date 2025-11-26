import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Container, Typography, Box, TextField, Button, MenuItem, Grid, Paper
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

export default function DonationsPage() {
  const router = useRouter();
  const [temples, setTemples] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    temple_id: "", day: "", dry_kg: 0, wet_kg: 0, plastic_kg: 0, collected_by: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: templesData } = await supabase.from("temples").select("unique_id,name");
    const { data: logsData } = await supabase.from("temple_daily_logs").select("*").order("day", { ascending: false }).limit(50);
    setTemples(templesData || []);
    setLogs(logsData || []);
    setLoading(false);
  }

  function calcPoints({ dry_kg, wet_kg, plastic_kg }) {
    const total = (Number(dry_kg) || 0) + (Number(wet_kg) || 0) + (Number(plastic_kg) || 0);
    return Math.floor(total / 5); // 1 point per 5kg
  }

  async function upsertLog(e) {
    e.preventDefault();
    if (!form.temple_id || !form.day) return alert("Temple and date required");
    const points = calcPoints(form);
    const payload = {
      temple_id: form.temple_id, day: form.day,
      dry_kg: Number(form.dry_kg), wet_kg: Number(form.wet_kg),
      plastic_kg: Number(form.plastic_kg), points,
      collected_by: form.collected_by, updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("temple_daily_logs").upsert(payload, { onConflict: ["temple_id", "day"] });
    if (error) { alert(error.message); return; }
    // Award points to temple: add points
    const { data: templeRow } = await supabase.from("temples").select("donation_points").eq("unique_id", form.temple_id).single();
    const newPoints = (templeRow?.donation_points || 0) + points;
    await supabase.from("temples").update({ donation_points: newPoints }).eq("unique_id", form.temple_id);
    setForm({ temple_id: "", day: "", dry_kg: 0, wet_kg: 0, plastic_kg: 0, collected_by: "" });
    load();
  }

  const bg = {
    minHeight: "100vh",
    width: "100%",
    background:
      `radial-gradient(circle at 18% 40%,rgba(36,255,190,0.13),transparent 46%),
      radial-gradient(circle at 88% 10%,rgba(80,255,100,0.13),transparent 47%),
      linear-gradient(135deg,#174f44 0%,#0f3e36 90%),
      repeating-linear-gradient(120deg,rgba(32,255,90,0.03) 0px,transparent 30px,transparent 86px)`,
    overflow: "hidden"
  };

  const glass = {
    background: "rgba(255,255,255,0.13)",
    border: "1.5px solid rgba(120,255,180,0.10)",
    boxShadow: "0 4px 32px 0 rgba(80,255,128,0.09)",
    backdropFilter: "blur(18px)",
    borderRadius: 14
  };

  if (loading)
    return (
      <Box sx={{ ...bg, width: "100vw", height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: "#b0ffd9", fontSize: 22 }}>Loading Logs...</Typography>
      </Box>
    );

  return (
    <Box sx={bg}>
      <Container sx={{ py: 4 }}>
        {/* BACK BUTTON AT TOP */}
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin")}
          sx={{
            mb: 2,
            bgcolor: "rgba(13,255,100,0.13)",
            color: "#1de87e",
            fontWeight: 700,
            borderRadius: 2
          }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{
          color: "#c1ffe8",
          fontWeight: 800,
          textShadow: "0 1.5px 12px #33ff80,0 1px 8px #174f44"
        }}>Daily Donations / Cumulative Logs</Typography>
        <Paper sx={{ ...glass, mt: 3, mb: 4, p: 3 }}>
          <Box component="form" onSubmit={upsertLog} sx={{ display: "grid", gap: 2 }}>
            <TextField select label="Temple" value={form.temple_id} onChange={e => setForm({ ...form, temple_id: e.target.value })} required
              sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
              <MenuItem value=""><em>Select</em></MenuItem>
              {temples.map(t => <MenuItem key={t.unique_id} value={t.unique_id}>{t.name} ({t.unique_id})</MenuItem>)}
            </TextField>
            <TextField type="date" label="Day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}
              InputLabelProps={{ shrink: true }} required
              sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Dry (kg)" type="number" value={form.dry_kg} onChange={e => setForm({ ...form, dry_kg: e.target.value })}
                sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
              <TextField label="Wet (kg)" type="number" value={form.wet_kg} onChange={e => setForm({ ...form, wet_kg: e.target.value })}
                sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
              <TextField label="Plastic (kg)" type="number" value={form.plastic_kg} onChange={e => setForm({ ...form, plastic_kg: e.target.value })}
                sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
            </Box>
            <TextField label="Collected by (NGO name)" value={form.collected_by} onChange={e => setForm({ ...form, collected_by: e.target.value })}
              sx={{ background: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
            <Button variant="contained" type="submit" sx={{
              bgcolor: "#27ffb7",
              color: "#194f37",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: "0 2px 12px #49ffb636"
            }}>Record / Update Log</Button>
          </Box>
        </Paper>
        <Typography variant="h6" sx={{ mb: 2, color: "#26ec8b", fontWeight: 700 }}>Recent Logs</Typography>
        <Grid container spacing={2}>
          {logs.map(l => (
            <Grid item xs={12} md={6} key={l.id}>
              <Paper elevation={8} sx={{ ...glass, p: 2 }}>
                <Typography sx={{ color: "#13e390", fontWeight: 700 }}>
                  <strong>{l.temple_id}</strong> • {new Date(l.day).toLocaleDateString()}
                </Typography>
                <Typography sx={{ color: "#b8ffe9" }}>
                  Dry: {l.dry_kg}kg | Wet: {l.wet_kg}kg | Plastic: {l.plastic_kg}kg • Points: {l.points}
                </Typography>
                <Typography variant="caption" sx={{ color: "#b8ffe9" }}>
                  Collected by: {l.collected_by} • Updated: {new Date(l.updated_at).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
