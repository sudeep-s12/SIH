import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Container, Typography, Box, Button, Grid, Card, CardContent, Paper,
  Divider, CircularProgress, TextField, MenuItem, Snackbar, Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

export default function NGODashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [assignedTemples, setAssignedTemples] = useState([]);
  const [ngoProfile, setNgoProfile] = useState({});
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ vehicle: "", certifications: "" });
  const [notif, setNotif] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    let mounted = true;
    async function guard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/login");
      const { data: profile } = await supabase.from("profiles").select("role, full_name, email").eq("id", session.user.id).single();
      if (!profile || profile.role !== "ngo") return router.replace("/login");
      if (mounted) setNgoProfile(profile);
      setLoading(false);
    }
    guard();
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace("/login");
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    loadAssignedTemples();
    loadPickupRequests();
  }, []);

  async function loadPickupRequests() {
    setPickups([
      {
        id: 1, temple: "Maruthi Mandira", waste: { dry: 34, wet: 15, plastic: 6 },
        status: "pending", requestedDate: "2025-11-26", note: "Bins almost full"
      },
      {
        id: 2, temple: "Sri Rama Temple", waste: { dry: 10, wet: 8, plastic: 2 },
        status: "accepted", requestedDate: "2025-11-25", note: ""
      },
    ]);
  }

  async function loadAssignedTemples() {
    setAssignedTemples([
      { id: "T1", name: "Maruthi Mandira", address: "Vijayanagara", contact: "TempleAdmin1", pickupSchedule: "Mon/Wed/Fri 10am" },
      { id: "T3", name: "Sri Rama Temple", address: "Gandhinagar", contact: "TempleAdmin2", pickupSchedule: "Tue/Thu 4pm" },
    ]);
  }

  function acceptPickup(id) {
    setPickups(ps => ps.map(p => p.id === id ? { ...p, status: "accepted" } : p));
    setNotif({ open: true, severity: "success", message: "Pickup accepted" });
  }
  function markPickedUp(id) {
    setPickups(ps => ps.map(p => p.id === id ? { ...p, status: "pickedup" } : p));
    setNotif({ open: true, severity: "success", message: "Pickup marked as completed" });
  }
  function rejectPickup(id) {
    setPickups(ps => ps.map(p => p.id === id ? { ...p, status: "rejected" } : p));
    setNotif({ open: true, severity: "warning", message: "Pickup rejected" });
  }

  function startProfileEdit() {
    setProfileForm({
      vehicle: ngoProfile.vehicle || "",
      certifications: ngoProfile.certifications || "",
    });
    setProfileEdit(true);
  }
  function saveProfileEdit() {
    setNgoProfile(prev => ({ ...prev, ...profileForm }));
    setProfileEdit(false);
    setNotif({ open: true, severity: "success", message: "Profile updated (demo; DB save needed)" });
  }

  const wasteTotal = { dry: 44, wet: 23, plastic: 8 };

  // --- Glassmorphic page background
  const bg = {
    minHeight: "100vh",
    width: "100%",
    px: 0,
    py: 0,
    background:
      `radial-gradient(circle at 8% 20%,rgba(36,255,190,0.16),transparent 42%), 
      radial-gradient(circle at 80% 10%,rgba(100,255,140,0.13),transparent 44%), 
      linear-gradient(135deg,#174f44 0%,#0f3e36 90%),
      repeating-linear-gradient(120deg,rgba(32,255,90,0.03) 0px,transparent 22px,transparent 54px)`,
    overflow: "hidden"
  };
  const glass = {
    background: "rgba(255,255,255,0.11)",
    border: "1.5px solid rgba(120,255,180,0.16)",
    boxShadow: "0 4px 32px 0 rgba(80,255,128,0.07)",
    backdropFilter: "blur(16px)",
    borderRadius: 14
  };

  if (loading) return (
    <Box sx={{ ...bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress color="success" />
    </Box>
  );

  return (
    <Box sx={bg}>
      <Container sx={{ py: 4 }}>
        {/* Dashboard title and logout */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: "rgba(0,128,90,0.25)",
              color: "#dfffdf",
              fontWeight: 600,
              borderRadius: 10,
              px: 2,
              '&:hover': { bgcolor: "rgba(32,255,100,0.22)" }
            }}
            onClick={() => { supabase.auth.signOut(); router.replace("/login"); }}
          >
            Log Out
          </Button>
          <Typography
            variant="h3"
            sx={{
              flexGrow: 1, color: "#d1ffe7",
              textShadow: "0 2px 20px #6effb8, 0 1px 12px #032f22",
              fontWeight: 800
            }}>
            NGO Dashboard
          </Typography>
        </Box>

        {/* Analytics Summary */}
        <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
          <Paper elevation={8} sx={{ ...glass, p: 2, minWidth: 190, flex: "1 0 180px" }}>
            <Typography fontWeight={600} sx={{ color: "#13e390" }}>This Week's Collection</Typography>
            <Typography fontSize={32} fontWeight={800} sx={{ color: "#27ffb7" }}>62 kg</Typography>
            <Typography sx={{ color: "#bbffe9" }}>Pickups Done: 4</Typography>
            <Typography color="text.secondary" fontSize={14}>Recyclable: {wasteTotal.dry + wasteTotal.plastic} kg</Typography>
            <Typography color="text.secondary" fontSize={14}>Non-Recyclable: {wasteTotal.wet} kg</Typography>
          </Paper>
          <Paper elevation={8} sx={{ ...glass, p: 2, minWidth: 190, flex: "1 0 180px" }}>
            <Typography fontWeight={600} sx={{ color: "#17dc7d" }}>Temple Compliance</Typography>
            <Typography fontSize={30} sx={{ color: "#d7ffd7" }}>92%</Typography>
            <Typography fontSize={14} color="text.secondary">On-time pickups: 11/12</Typography>
          </Paper>
        </Box>

        {/* PICKUP REQUESTS */}
        <Typography variant="h6" sx={{ mb: 1, color: "#27ec83", fontWeight: 700 }}>Pickup Requests</Typography>
        <Grid container spacing={2} mb={3}>
          {pickups.length === 0 && <Grid item xs={12}><Typography>No pickups assigned</Typography></Grid>}
          {pickups.map(request => (
            <Grid item xs={12} md={6} key={request.id}>
              <Card sx={{ ...glass, p: 2, minHeight: 120 }}>
                <CardContent>
                  <Typography fontWeight={700} sx={{ color: "#14c47c" }}>{request.temple} — {request.requestedDate}</Typography>
                  <Typography sx={{ color: "#bbffe9" }}>Dry: {request.waste.dry}kg | Wet: {request.waste.wet}kg | Plastic: {request.waste.plastic}kg</Typography>
                  <Typography sx={{ mb: 2, color: "text.secondary" }}>{request.note || "\u00A0"}</Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {request.status === "pending" && (
                      <>
                        <Button startIcon={<CheckIcon />} color="success" variant="contained" onClick={() => acceptPickup(request.id)}>Accept</Button>
                        <Button startIcon={<ClearIcon />} color="error" variant="contained" onClick={() => rejectPickup(request.id)}>Reject</Button>
                      </>
                    )}
                    {request.status === "accepted" && (
                      <Button startIcon={<CheckIcon />} variant="outlined" onClick={() => markPickedUp(request.id)}>Mark Picked Up</Button>
                    )}
                    {request.status === "pickedup" && (
                      <Typography color="primary"><CheckIcon fontSize="small" /> Picked Up</Typography>
                    )}
                    {request.status === "rejected" && (
                      <Typography color="error"><ClearIcon fontSize="small" /> Rejected</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ASSIGNED TEMPLES */}
        <Divider sx={{ my: 4, borderColor: "rgba(36,255,190,0.22)" }} />
        <Typography variant="h6" sx={{ mb: 1, color: "#1de87e", fontWeight: 700 }}>Assigned Temples</Typography>
        <Grid container spacing={2}>
          {assignedTemples.length === 0 && <Grid item xs={12}><Typography>No assigned temples.</Typography></Grid>}
          {assignedTemples.map(t => (
            <Grid item key={t.id} xs={12} md={4}>
              <Paper elevation={8} sx={{ ...glass, p: 2 }}>
                <Typography fontWeight={700} sx={{ color: "#0cec67" }}>{t.name}</Typography>
                <Typography color="text.secondary">{t.address}</Typography>
                <Typography sx={{ color: "#bbffe9" }}>Contact: {t.contact}</Typography>
                <Typography color="success.main">Pickup: {t.pickupSchedule}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* NGO PROFILE MANAGEMENT */}
        <Divider sx={{ my: 4, borderColor: "rgba(36,255,190,0.25)" }} />
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#17e480", fontWeight: 700 }}>NGO Profile</Typography>
          {!profileEdit && <Button variant="text" startIcon={<EditIcon />} sx={{
            color: "#13e390", bgcolor: "rgba(36,255,190,0.10)", borderRadius: 2
          }} onClick={startProfileEdit}>Edit</Button>}
        </Box>
        {profileEdit ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Pickup Vehicle Details" value={profileForm.vehicle} onChange={e => setProfileForm(f => ({ ...f, vehicle: e.target.value }))}
              sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
            <TextField label="Certifications" value={profileForm.certifications} onChange={e => setProfileForm(f => ({ ...f, certifications: e.target.value }))}
              sx={{ background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
            <Button variant="contained" sx={{
              bgcolor: "#48ea8c",
              color: "#173c24",
              fontWeight: 700,
              borderRadius: 2
            }} onClick={saveProfileEdit}>Save</Button>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ color: "#ecfffc" }}>Pickup Vehicle: {ngoProfile.vehicle || <i>Not set</i>}</Typography>
            <Typography sx={{ color: "#bbffe9" }}>Certifications: {ngoProfile.certifications || <i>Not set</i>}</Typography>
          </Box>
        )}

        <Snackbar open={notif.open} autoHideDuration={3200} onClose={() => setNotif(s => ({ ...s, open: false }))}>
          <Alert severity={notif.severity}>{notif.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
