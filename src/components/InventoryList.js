//Inventory Frontend Component

import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => setInventory(data));
  }, []);

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Inventory
      </Typography>
      <List>
        {inventory.map(item => (
          <ListItem key={item.id}>
            <ListItemText primary={`${item.item}: ${item.quantity}`} secondary={`Updated: ${new Date(item.lastUpdated).toLocaleString()}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
