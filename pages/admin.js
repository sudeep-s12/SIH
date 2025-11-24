import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

export default function AdminDashboard() {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTemple, setNewTemple] = useState({ name: "", address: "", unique_id: "", is_historic: false, donation_pct: 0, donation_points: 0, image: "" });
  const [feedback, setFeedback] = useState("");

  // Load temple data
  useEffect(() => {
    fetchTemples();
  }, []);

  async function fetchTemples() {
    setLoading(true);
    const { data, error } = await supabase.from("temples").select("*");
    setTemples(data || []);
    setLoading(false);
  }

  async function handleAddTemple(e) {
    e.preventDefault();
    setFeedback("");
    // (Optional) handle image upload separately, get the public URL & store in `image`
    const { error } = await supabase.from("temples").insert([newTemple]);
    if (error) setFeedback(error.message);
    else {
      setFeedback("Temple added!");
      setNewTemple({ name: "", address: "", unique_id: "", is_historic: false, donation_pct: 0, donation_points: 0, image: "" });
      fetchTemples();
    }
  }

  async function handleDeleteTemple(unique_id) {
    if (!window.confirm("Delete this temple?")) return;
    const { error } = await supabase.from("temples").delete().eq("unique_id", unique_id);
    if (!error) fetchTemples();
  }

  return (
    <div style={{ padding: 40, fontFamily: "Poppins, sans-serif" }}>
      <h1 style={{ color: "#886200" }}>Admin Panel — Manage Temples</h1>
      <form onSubmit={handleAddTemple} style={{ marginBottom: 32 }}>
        <input placeholder="Temple Name" value={newTemple.name} onChange={e => setNewTemple({ ...newTemple, name: e.target.value })} required style={{ marginRight: 8 }} />
        <input placeholder="Unique ID (eg: 01)" value={newTemple.unique_id} onChange={e => setNewTemple({ ...newTemple, unique_id: e.target.value })} required style={{ marginRight: 8 }} />
        <input placeholder="Address" value={newTemple.address} onChange={e => setNewTemple({ ...newTemple, address: e.target.value })} required style={{ marginRight: 8, width: 180 }} />
        <label>
          <input type="checkbox" checked={newTemple.is_historic} onChange={e => setNewTemple({ ...newTemple, is_historic: e.target.checked })} />
          Historic
        </label>
        {/* Image upload can be added here (see below) */}
        <button type="submit" style={{ marginLeft: 10 }}>Add Temple</button>
      </form>
      {feedback && <div style={{ color: "#007d25", fontWeight: 600 }}>{feedback}</div>}

      <h2>All Temples</h2>
      {loading ? "Loading..." : (
        <table border={1} style={{ width: "100%", marginTop: 10, background: "#fafafa" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Address</th>
              <th>Historic?</th>
              <th>Points</th>
              <th>Donated %</th>
              <th>Image</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {temples.map(t => (
              <tr key={t.unique_id}>
                <td>{t.name}</td>
                <td>{t.unique_id}</td>
                <td>{t.address}</td>
                <td>{t.is_historic ? "Yes" : ""}</td>
                <td>{t.donation_points}</td>
                <td>{t.donation_pct}%</td>
                <td>
                  {t.image && <img src={t.image} alt="temple" style={{ maxWidth: 44, borderRadius: 6 }} />}
                </td>
                <td>
                  <button onClick={() => handleDeleteTemple(t.unique_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
