import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabaseClient';

export default function Inventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    supabase.from('inventory').select('*').then(({ data, error }) => {
      if (error) alert(error.message);
      else setItems(data);
    });
  }, []);

  return (
    <div>
      <h2>Inventory List</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.item} — Quantity: {item.quantity}</li>
        ))}
      </ul>
    </div>
  );
}
