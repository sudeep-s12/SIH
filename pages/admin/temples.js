import { useEffect, useState, useRef } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Container, Typography, Box, TextField, Button, Grid,
  Card, CardContent, CardMedia, Dialog, DialogTitle, DialogContent,
  DialogActions
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/router";

const IMAGE_FALLBACK = "https://placehold.co/200x150?text=No+Image";

export default function TempleManager() {
  const router = useRouter();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    unique_id: "",
    address: "",
    lat: "",
    lng: "",
    is_historic: false,
    image: ""
  });
  const fileRef = useRef(null);

  useEffect(() => { fetchTemples(); }, []);

  async function fetchTemples() {
    setLoading(true);
    const { data, error } = await supabase
      .from("temples")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setTemples(data || []);
    setLoading(false);
  }

  async function uploadImage(file, unique_id) {
    if (!file) return form.image || "";
    const cleanId = unique_id.replace(/[^a-zA-Z0-9-_]/g, "");
    const filePath = `${cleanId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("temple-images").upload(filePath, file, { upsert: true });
    if (uploadError) { alert("Image upload failed!"); return ""; }
    const { data: publicUrl } = supabase.storage.from("temple-images").getPublicUrl(filePath);
    return publicUrl.publicUrl;
  }

  async function handleSave(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const imageUrl = await uploadImage(file, form.unique_id || form.name.replace(/\s+/g, "-").toLowerCase());
    const payload = {
      name: form.name,
      unique_id: form.unique_id,
      address: form.address,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      is_historic: form.is_historic,
      image: imageUrl,
    };
    let error;
    if (editId) {
      const { error: updateError } = await supabase.from("temples").update(payload).eq("unique_id", editId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("temples").insert([payload]);
      error = insertError;
    }
    if (error) { alert("Database error: " + error.message); return; }
    setOpen(false);
    setForm({ name: "", unique_id: "", address: "", lat: "", lng: "", is_historic: false, image: "" });
    if (fileRef.current) fileRef.current.value = "";
    fetchTemples();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this temple?")) return;
    const { error } = await supabase.from("temples").delete().eq("unique_id", id);
    if (error) alert(error.message);
    fetchTemples();
  }

  function openCreate() {
    setEditId(null);
    setForm({ name: "", unique_id: "", address: "", lat: "", lng: "", is_historic: false, image: "" });
    setOpen(true);
  }
  function openEdit(t) {
    setEditId(t.unique_id);
    setForm(t);
    setOpen(true);
  }
  function mapPreview(lat, lng) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
  }

  // Glass background
  const bg = {
    minHeight: "100vh",
    width: "100%",
    background:
      `radial-gradient(circle at 12% 26%,rgba(36,255,190,0.13),transparent 42%),
      radial-gradient(circle at 78% 19%,rgba(200,255,190,0.09),transparent 44%),
      linear-gradient(135deg,#174f44 0%,#0f3e36 90%)`,
    overflow: "hidden"
  };
  const glass = {
    background: "rgba(255,255,255,0.15)",
    border: "1.5px solid rgba(120,255,180,0.13)",
    boxShadow: "0 4px 20px 0 rgba(60,255,128,0.09)",
    backdropFilter: "blur(13px)",
    borderRadius: 13
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
            mb: 3,
            bgcolor: "rgba(13,255,130,0.12)",
            color: "#19e480",
            fontWeight: 700,
            borderRadius: 2
          }}
        >
          Back to Dashboard
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" sx={{
            color: "#17e480",
            fontWeight: 800,
            textShadow: "0 1.5px 10px #23ff80,0 1px 7px #174f44"
          }}>Temples</Typography>
          <Button variant="contained" sx={{
            bgcolor: "#15de7e", color: "#173c24", fontWeight: 700,
            borderRadius: 2, px: 3, boxShadow: "0 2px 12px #1de87e26"
          }} onClick={openCreate}>Add Temple</Button>
        </Box>
        <Grid container spacing={2}>
          {temples.map((t) => (
            <Grid item xs={12} md={6} key={t.unique_id}>
              <Card sx={{ ...glass, display: "flex", p: 1 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 140, height: 140, borderRadius: 2, bgcolor: "#c7ffe7", objectFit: "cover" }}
                  image={t.image || IMAGE_FALLBACK}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography fontWeight={800} sx={{ color: "#12e09b" }}>{t.name} <small>#{t.unique_id}</small></Typography>
                  <Typography variant="body2" color="text.secondary">{t.address}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" startIcon={<EditIcon />} sx={{ bgcolor: "rgba(36,255,190,0.11)", color: "#15de7e", mr: 1 }} onClick={() => openEdit(t)}>Edit</Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} sx={{ mr: 1 }} onClick={() => handleDelete(t.unique_id)}>Delete</Button>
                    {t.lat && t.lng && (
                      <Button size="small" href={mapPreview(t.lat, t.lng)} target="_blank" sx={{
                        bgcolor: "rgba(13,255,130,0.10)", color: "#17e480"
                      }}>Map</Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"
          sx={{ "& .MuiPaper-root": { ...glass } }}>
          <DialogTitle sx={{ fontWeight: 800, color: "#18dd85" }}>{editId ? "Edit Temple" : "Add Temple"}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
              <TextField label="Name" value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })}
                sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
              <TextField label="Unique ID" value={form.unique_id} required onChange={e => setForm({ ...form, unique_id: e.target.value })}
                sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
              <TextField label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField label="Latitude" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })}
                  sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
                <TextField label="Longitude" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })}
                  sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
              </Box>
              <Button variant="outlined" component="label" sx={{
                bgcolor: "rgba(36,255,190,0.09)", color: "#17e480", fontWeight: 600, borderRadius: 2
              }}>
                Upload Image
                <input hidden ref={fileRef} type="file" accept="image/*" />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} sx={{ color: "#1de87e" }}>Cancel</Button>
            <Button variant="contained" sx={{
              bgcolor: "#15de7e", color: "#173c24", fontWeight: 700, borderRadius: 2
            }} onClick={handleSave}>{editId ? "Save" : "Create"}</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
