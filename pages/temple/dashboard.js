import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Container, Typography, Box, Button, Grid, Card, CardContent, Paper,
  TextField, MenuItem, Snackbar, Alert, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageIcon from "@mui/icons-material/Image";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const WASTE_TYPES = ["Flowers", "Coconuts", "Paper", "Plastic", "Oil lamps", "Other"];

export default function TempleDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [ngo, setNGO] = useState(null);
  const [templeProfile, setTempleProfile] = useState({});
  const [donationForm, setDonationForm] = useState({
    type: "", quantity: "", photo: null, note: "", status: "pending"
  });
  const donationPhotoRef = useRef(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    temple_name: "", phone: "", password: ""
  });
  const [notif, setNotif] = useState({
    open: false, message: "", severity: "success"
  });

  useEffect(() => {
    async function guard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/login");
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, temple_name, email, phone")
        .eq("id", session.user.id)
        .single();
      if (error || !profile || profile.role !== "temple") {
        return router.replace("/login");
      }
      setTempleProfile(profile);
      setLoading(false);
    }
    guard();
  }, []);

  useEffect(() => {
    setDonations([
      { id: 1, date: "2025-11-24", type: "Flowers", quantity: 10, points: 5, status: "pickedup" },
      { id: 2, date: "2025-11-22", type: "Plastic", quantity: 2, points: 1, status: "pending" }
    ]);
    setNGO({
      name: "Green Earth NGO",
      phone: "9876000123",
      email: "greenearth@ngo.com",
      pickupSchedule: "Mon / Thu - 10am"
    });
  }, []);

  function handleDonationChange(e) {
    const { name, value } = e.target;
    setDonationForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmitDonation(e) {
    e.preventDefault();
    setNotif({ open: true, message: "Donation submitted!", severity: "success" });
    setDonations(prev => [
      {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        type: donationForm.type,
        quantity: donationForm.quantity,
        status: "pending",
        points: 2
      },
      ...prev
    ]);
    setDonationForm({ type: "", quantity: "", note: "" });
    if (donationPhotoRef.current) donationPhotoRef.current.value = "";
  }

  function startProfileEdit() {
    setProfileForm({
      temple_name: templeProfile.temple_name,
      phone: templeProfile.phone,
      password: ""
    });
    setEditProfile(true);
  }

  function saveProfileEdit() {
    setTempleProfile(prev => ({
      ...prev,
      temple_name: profileForm.temple_name,
      phone: profileForm.phone
    }));
    setNotif({ open: true, message: "Profile updated (local only)", severity: "success" });
    setEditProfile(false);
  }

  // --- Glassmorphic page background
  const bg = {
    minHeight: "100vh",
    width: "100%",
    px: 0,
    py: 0,
    // 3D green glass and radial gradient layers
    background:
      `radial-gradient(circle at 15% 30%, rgba(36, 255, 190, 0.18), transparent 45%), 
      radial-gradient(circle at 80% 10%, rgba(100,255,140,0.14), transparent 44%), 
      linear-gradient(135deg, #174f44 0%, #0f3e36 90%), 
      repeating-linear-gradient(115deg, rgba(32,255,90,0.03) 0px, transparent 22px, transparent 50px)`,
    overflow: "hidden"
  };

  // --- Card/Panel style
  const glass = {
    background: "rgba(255,255,255,0.09)",
    border: "1.5px solid rgba(120,255,180,0.15)",
    boxShadow: "0 4px 32px 0 rgba(80,255,128,0.07)",
    backdropFilter: "blur(16px)",
    borderRadius: 14
  };

  if (loading)
    return (
      <Box sx={{ ...bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress color="success" />
      </Box>
    );

  return (
    <Box sx={bg}>
      <Container sx={{ py: 4 }}>
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Button
            startIcon={<LogoutIcon />}
            sx={{
              bgcolor: "rgba(0,128,64,0.25)",
              color: "#dfffdf",
              fontWeight: 600,
              borderRadius: 10,
              px: 2,
              '&:hover': { bgcolor: "rgba(24,255,100,0.22)" }
            }}
            onClick={() => { supabase.auth.signOut(); router.replace("/login"); }}
          >
            Logout
          </Button>
          <Typography variant="h3" sx={{
            color: "#d1ffe7",
            textShadow: "0 2px 25px #6effb8, 0 1px 8px #032f22",
            fontWeight: 800
          }}>
            Temple Dashboard
          </Typography>
        </Box>

        {/* DONATION FORM CARD */}
        <Paper elevation={8} sx={{ ...glass, p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#15df6b", mb: 2 }}>
            Submit Waste Donation
          </Typography>
          <Box component="form" onSubmit={handleSubmitDonation} sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
            <TextField select name="type" label="Waste Type" value={donationForm.type}
              onChange={handleDonationChange} required sx={{ minWidth: 140, background: "rgba(255,255,255,0.12)", borderRadius: 2 }}>
              {WASTE_TYPES.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
            </TextField>

            <TextField name="quantity" label="Qty (kg)" type="number"
              value={donationForm.quantity} onChange={handleDonationChange} required
              sx={{ width: 120, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />

            <Button component="label" startIcon={<ImageIcon />} sx={{
              bgcolor: "rgba(36,255,190,0.1)", borderRadius: 2, color: "#36eaa8",
              fontWeight: 700, px: 2, minWidth: 100
            }}>
              Upload
              <input ref={donationPhotoRef} type="file" hidden />
            </Button>

            <Button type="submit" variant="contained" startIcon={<AddIcon />}
              sx={{
                bgcolor: "#49ea8d",
                color: "#173c24",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                boxShadow: "0 2px 12px #2cff8e36"
              }}>
              Submit
            </Button>
          </Box>
        </Paper>

        {/* DONATION HISTORY */}
        <Typography variant="h6" sx={{ mb: 2, color: "#27ec83", fontWeight: 700 }}>
          <HistoryIcon sx={{ mr: 1, verticalAlign: "bottom" }} /> Donation History
        </Typography>
        <Grid container spacing={2}>
          {donations.map(item => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ ...glass, p: 2 }}>
                <CardContent>
                  <Typography fontWeight={800} color="#14c47c">
                    {item.type} — {item.quantity}kg <span style={{ float: "right" }}>{item.points} pts</span>
                  </Typography>
                  <Typography sx={{ color: "#c6ffe7" }}>{item.date}</Typography>
                  <Box sx={{
                    mt: 1,
                    color: item.status === "pickedup" ? "#38ffb2" : "#ffd700",
                    fontWeight: 600
                  }}>
                    Status: {item.status}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* NGO SECTION */}
        <Divider sx={{ my: 4, borderColor: "rgba(36,255,190,0.28)" }} />
        <Typography variant="h6" sx={{ color: "#1de87e", fontWeight: 700 }}>Your Assigned NGO</Typography>
        {ngo ? (
          <Paper sx={{ ...glass, p: 2, mb: 4 }}>
            <Typography fontWeight={700} sx={{ color: "#0cec67" }}>{ngo.name}</Typography>
            <Typography><PhoneIcon sx={{ color: "#16d573", mr: 1 }} /> {ngo.phone}</Typography>
            <Typography><EmailIcon sx={{ color: "#14c47c", mr: 1 }} /> {ngo.email}</Typography>
            <Typography color="success.main">Pickup: {ngo.pickupSchedule}</Typography>
          </Paper>
        ) : (
          <Typography sx={{ color: "#ffdddd" }}>No NGO assigned</Typography>
        )}

        {/* PROFILE */}
        <Divider sx={{ my: 4, borderColor: "rgba(36,255,190,0.28)" }} />
        <Typography variant="h6" sx={{ color: "#17e480", fontWeight: 700 }}>Temple Profile</Typography>
        {!editProfile ? (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ color: "#ecfffc" }}>Temple: {templeProfile.temple_name}</Typography>
            <Typography sx={{ color: "#bbffe9" }}>Phone: {templeProfile.phone}</Typography>
            <Typography sx={{ color: "#c8ffe4" }}>Email: {templeProfile.email}</Typography>
            <Button sx={{
              mt: 2,
              bgcolor: "rgba(36,255,190,0.10)",
              color: "#1ade7d",
              fontWeight: 700,
              borderRadius: 2
            }} startIcon={<EditIcon />} onClick={startProfileEdit}>Edit</Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <TextField label="Temple Name" value={profileForm.temple_name}
              onChange={e => setProfileForm({ ...profileForm, temple_name: e.target.value })}
              sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2 }} />

            <TextField label="Phone" value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2 }} />

            <TextField label="New Password" type="password"
              onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
              sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2 }} />

            <Button variant="contained" sx={{
              bgcolor: "#48ea8c",
              color: "#173c24",
              fontWeight: 700,
              borderRadius: 2
            }} onClick={saveProfileEdit}>Save</Button>
          </Box>
        )}
        <Snackbar open={notif.open} autoHideDuration={3000}
          onClose={() => setNotif({ ...notif, open: false })}>
          <Alert severity={notif.severity}>{notif.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
