import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Box, Button, CircularProgress, Typography, Grid, Card,
  CardActionArea, CardContent
} from "@mui/material";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import PublicIcon from "@mui/icons-material/Public";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";

const TILES = [
  {
    label: "Manage Temples",
    href: "/admin/temples",
    icon: <TempleBuddhistIcon sx={{ fontSize: 48, color: "#a8802a" }} />,
    desc: "Add, edit, or remove temple partners"
  },
  {
    label: "Manage NGOs",
    href: "/admin/ngos",
    icon: <PublicIcon sx={{ fontSize: 48, color: "#2b8a3e" }} />,
    desc: "Control all NGO partners and assignments"
  },
  {
    label: "Donations & Collections",
    href: "/admin/donations",
    icon: <HistoryEduIcon sx={{ fontSize: 48, color: "#0d6efd" }} />,
    desc: "See daily temple waste logs and points"
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: <Inventory2Icon sx={{ fontSize: 48, color: "#714eff" }} />,
    desc: "Track current waste inventory stats"
  },
];

export default function AdminIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function guard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/login");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (!profile || profile.role !== "admin") return router.replace("/login");
      if (mounted) setLoading(false);
    }
    guard();
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace("/login");
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  // Glassmorphic background
  const bg = {
    minHeight: "100vh",
    width: "100%",
    px: 0,
    py: 0,
    background:
      `radial-gradient(circle at 20% 22%,rgba(36,255,190,0.11),transparent 44%),
      radial-gradient(circle at 88% 10%,rgba(100,255,140,0.13),transparent 44%),
      linear-gradient(135deg,#174f44 0%,#0f3e36 90%),
      repeating-linear-gradient(120deg,rgba(32,255,90,0.03) 0px,transparent 22px,transparent 76px)`,
    overflow: "hidden"
  };
  const glass = {
    background: "rgba(255,255,255,0.14)",
    border: "1.5px solid rgba(120,255,180,0.12)",
    boxShadow: "0 4px 24px 0 rgba(80,255,128,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: 16
  };

  if (loading)
    return <Box sx={{ ...bg, width: "100vw", height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress color="success" />
    </Box>;

  return (
    <Box sx={bg}>
      <Box sx={{ maxWidth: 1400, margin: "0 auto", p: { xs: 2, md: 6 }, pb: 4 }}>
        {/* Header bar */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <Typography variant="h3" sx={{
            fontWeight: 800,
            flexGrow: 1,
            color: "#d1ffe7",
            textShadow: "0 2px 25px #6effb8, 0 1px 8px #215f48"
          }}>
            Admin Dashboard
          </Typography>
          <Button startIcon={<LogoutIcon />}
            onClick={logout}
            variant="contained"
            sx={{
              bgcolor: "rgba(243,34,101,0.17)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 10,
              px: 2,
              '&:hover': { bgcolor: "#ff2b6a" }
            }}
          >Logout</Button>
        </Box>
        <Typography sx={{ mb: 4, color: "#b8ffe9", fontSize: 18 }}>
          Select a dashboard section below:
        </Typography>
        <Grid container spacing={4} justifyContent="flex-start">
          {TILES.map(tile => (
            <Grid item key={tile.label} xs={12} sm={6} md={3}>
              <Link href={tile.href} passHref legacyBehavior>
                <Card elevation={8} sx={{
                  ...glass,
                  transition: "transform .2s cubic-bezier(.4,1.6,.38,.93), box-shadow .22s",
                  borderRadius: 8,
                  "&:hover": { boxShadow: 16, transform: "translateY(-6px) scale(1.045)" }
                }}>
                  <CardActionArea sx={{ height: 180, p: 2, textAlign: "center", borderRadius: 8 }}>
                    {tile.icon}
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} sx={{ color: "#0de172", mb: 1 }}>
                        {tile.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#b8ffe9", fontSize: 15 }}>
                        {tile.desc}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
