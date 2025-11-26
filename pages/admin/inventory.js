import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
} from "@mui/material";

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const { data } = await supabase.from("inventory").select("*");
    setItems(data || []);
  }

  async function addItem() {
    if (!item || !qty) return;
    await supabase.from("inventory").insert([
      { item, quantity: parseInt(qty), last_updated: new Date() },
    ]);
    setItem("");
    setQty("");
    loadItems();
  }

  const bg = {
    minHeight: "100vh",
    width: "100%",
    background:
      `radial-gradient(circle at 14% 30%,rgba(36,255,190,0.10),transparent 44%),
      radial-gradient(circle at 89% 18%,rgba(200,255,190,0.09),transparent 44%),
      linear-gradient(135deg,#174f44 0%,#0f3e36 90%)`,
    overflow: "hidden"
  };

  const glass = {
    background: "rgba(255,255,255,0.14)",
    border: "1.5px solid rgba(120,255,180,0.11)",
    boxShadow: "0 4px 16px 0 rgba(80,255,128,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: 14
  };

  return (
    <Box sx={bg}>
      <Container sx={{ py: 5 }}>
        {/* BACK BUTTON AT TOP */}
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin")}
          sx={{
            mb: 3,
            bgcolor: "rgba(13,255,130,0.11)",
            color: "#0de172",
            fontWeight: 700,
            borderRadius: 2
          }}
        >
          Back to Dashboard
        </Button>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#15de7e",
            mb: 4,
            textShadow: "0 1px 10px #33ff80,0 1px 8px #174f44"
          }}
        >
          🧱 Inventory Management
        </Typography>
        <Paper sx={{ ...glass, p: 3, mb: 4, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Item name"
            fullWidth
            value={item}
            onChange={(e) => setItem(e.target.value)}
            sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2 }}
          />
          <TextField
            label="Quantity"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            sx={{ background: "rgba(255,255,255,0.13)", borderRadius: 2, width: 110 }}
          />
          <Button
            variant="contained"
            sx={{
              background: "#15de7e",
              color: "#194f39",
              fontWeight: 700,
              borderRadius: 2,
              px: 3
            }}
            onClick={addItem}
          >
            ADD
          </Button>
        </Paper>
        {items.length === 0 ? (
          <Typography sx={{ color: "#b8ffe9", fontWeight: 700, mt: 2 }}>No inventory items yet.</Typography>
        ) : (
          items.map((i) => (
            <Paper key={i.id} sx={{ ...glass, p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#13e390", fontWeight: 700 }}>{i.item}</Typography>
              <Typography sx={{ color: "#c8ffe9" }}>Quantity: {i.quantity}</Typography>
              <Typography sx={{ fontSize: "12px", color: "#b5e8cc" }}>
                Last updated: {new Date(i.last_updated).toLocaleString()}
              </Typography>
            </Paper>
          ))
        )}
      </Container>
    </Box>
  );
}
