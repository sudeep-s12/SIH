import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Container, Grid, Box, Typography, TextField, Button, MenuItem, Card,
  CardContent, Avatar, IconButton, CircularProgress, Snackbar, Alert
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

const LOGO_BUCKET = "ngo-logos";

function sanitizePathSegment(s) {
  return String(s || "").replace(/[^a-z0-9_\-\.]/gi, "_");
}

export default function NGOManager() {
  const router = useRouter();
  const [ngos, setNgos] = useState([]);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", contact: "", assign_temple: "" });
  const fileRef = useRef(null);
  const [notif, setNotif] = useState({ open: false, severity: "info", message: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const { data: ngosData } = await supabase.from("ngos").select("*").order("created_at", { ascending: false });
    setNgos(ngosData || []);
    const { data: templesData } = await supabase.from("temples").select("name,unique_id").order("name");
    setTemples(templesData || []);
    setLoading(false);
  }

  async function uploadLogo(file, ngoName) {
    if (!file) return "";
    const safeFolder = sanitizePathSegment(String(ngoName || "ngo"));
    const path = `${safeFolder}/${Date.now()}-${sanitizePathSegment(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, { upsert: true });
    if (uploadError) {
      setNotif({ open: true, severity: "error", message: `Upload failed: ${uploadError.message}` });
      return "";
    }
    const { data: urlData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
    return urlData.publicUrl || "";
  }

  async function handleAddNGO(e) {
    e.preventDefault();
    if (!form.name?.trim()) {
      setNotif({ open: true, severity: "warning", message: "Please enter an NGO name." });
      return;
    }
    setLoading(true);
    const file = fileRef.current?.files?.[0];
    const logoUrl = await uploadLogo(file, form.name);
    const payload = {
      name: form.name.trim(),
      contact: form.contact || null,
      logo: logoUrl || null,
      assigned_temple: form.assign_temple || null,
      created_at: new Date().toISOString(),
    };
    let error;
    if (editing) {
      const { error: updateError } = await supabase.from("ngos").update(payload).eq("id", editing);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("ngos").insert([payload]);
      error = insertError;
    }
    if (error) {
      setNotif({ open: true, severity: "error", message: `Save failed: ${error.message}` });
    } else {
      setNotif({ open: true, severity: "success", message: editing ? "NGO updated!" : "NGO added!" });
      setForm({ name: "", contact: "", assign_temple: "" });
      setEditing(null);
      if (fileRef.current) fileRef.current.value = "";
      loadAll();
    }
    setLoading(false);
  }

  async function handleDelete(ngo) {
    if (!confirm(`Delete NGO "${ngo.name}"? This cannot be undone.`)) return;
    setLoading(true);
    const { error } = await supabase.from("ngos").delete().eq("id", ngo.id);
    if (error) setNotif({ open: true, severity: "error", message: `Delete failed: ${error.message}` });
    else setNotif({ open: true, severity: "success", message: "Deleted" });
    setLoading(false);
    loadAll();
  }

  function setEditValues(n) {
    setEditing(n.id);
    setForm({
      name: n.name || "",
      contact: n.contact || "",
      assign_temple: n.assigned_temple || "",
    });
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bg = {
    minHeight: "100vh",
    width: "100%",
    background:
      `radial-gradient(circle at 20% 22%,rgba(36,255,190,0.11),transparent 44%),
      radial-gradient(circle at 88% 10%,rgba(100,255,140,0.13),transparent 44%),
      linear-gradient(135deg,#174f44 0%,#0f3e36 90%),
      repeating-linear-gradient(120deg,rgba(32,255,90,0.04) 0px,transparent 30px,transparent 82px)`,
    overflow: "hidden"
  };
  const glass = {
    background: "rgba(255,255,255,0.12)",
    border: "1.5px solid rgba(120,255,180,0.14)",
    boxShadow: "0 4px 16px 0 rgba(80,255,128,0.06)",
    backdropFilter: "blur(12px)",
    borderRadius: 14
  };

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
          color: "#15df6d",
          fontWeight: 800,
          mb: 3,
          textShadow: "0 2px 12px #3aff80,0 1px 7px #174f44"
        }}>NGO Partners</Typography>
        <Box component="form" onSubmit={handleAddNGO} sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField label="NGO Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
            sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2 }} />
          <TextField label="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
            sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2 }} />
          <TextField select label="Assign Temple" value={form.assign_temple} onChange={e => setForm({ ...form, assign_temple: e.target.value })}
            sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2, minWidth: 170 }}>
            <MenuItem value="">(none)</MenuItem>
            {temples.map(t => <MenuItem key={t.unique_id} value={t.unique_id}>{t.name} ({t.unique_id})</MenuItem>)}
          </TextField>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{
            bgcolor: "rgba(36,255,150,0.08)", color: "#17e480", borderRadius: 2, fontWeight: 600
          }}>
            Upload Logo
            <input hidden ref={fileRef} type="file" accept="image/*" />
          </Button>
          <Button variant="contained" startIcon={editing ? <EditIcon /> : <AddIcon />} type="submit"
            sx={{
              bgcolor: "#15de7e", color: "#173c24", fontWeight: 700, borderRadius: 2, px: 3
            }}>
            {editing ? "Save" : "Add NGO"}
          </Button>
        </Box>
        {loading ? <CircularProgress color="success" /> : (
          <Grid container spacing={2}>
            {ngos.map(n => (
              <Grid item xs={12} md={4} key={n.id}>
                <Card sx={{ ...glass, display: "flex", alignItems: "center", p: 2, gap: 2 }}>
                  <Avatar src={n.logo || ""} alt={n.name} sx={{
                    width: 80, height: 80, fontSize: 22,
                    bgcolor: "#17e480",
                    color: "#fff", mr: 2, boxShadow: "0 2px 12px #3aff8032"
                  }}>
                    {n.name.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography fontWeight={800} sx={{ color: "#14e388" }}>{n.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{n.contact || "--"}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "#b8ffe9" }}>
                      Assigned Temple: {n.assigned_temple ? <b>{n.assigned_temple}</b> : "None"}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <IconButton onClick={() => setEditValues(n)} sx={{ color: "#27ffb7" }}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(n)}><DeleteIcon /></IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Snackbar open={notif.open} autoHideDuration={4000} onClose={() => setNotif(s => ({ ...s, open: false }))}>
          <Alert severity={notif.severity}>{notif.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
