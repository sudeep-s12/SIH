// src/components/AdminNavbar.js
import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

export default function AdminNavbar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "#ffffff",
        color: "#333",
        borderBottom: "1px solid #ddd",
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff6600" }}>
          Admin Dashboard
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} href="/admin/temples">
            Temples
          </Button>
          <Button color="inherit" component={Link} href="/admin/ngos">
            NGOs
          </Button>
          <Button color="inherit" component={Link} href="/admin/inventory">
            Inventory
          </Button>
          <Button color="inherit" component={Link} href="/admin/donations">
            Donations
          </Button>
          <Button color="error" component={Link} href="/login">
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
