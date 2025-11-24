//    # Inventory management

import React from 'react';
import InventoryList from '../components/InventoryList';
import Layout from '../components/Layout';

export default function Inventory() {
  return (
    <Layout>
      <h1>Inventory Management</h1>
      <InventoryList />
    </Layout>
  );
}
