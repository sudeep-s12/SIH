//Inventory API Router

let inventory = [
  { id: 1, item: 'Flower Waste', quantity: 50, lastUpdated: new Date() },
  { id: 2, item: 'Organic Ash', quantity: 30, lastUpdated: new Date() },
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(inventory);
  } else if (req.method === 'POST') {
    const newEntry = { ...req.body, id: inventory.length + 1, lastUpdated: new Date() };
    inventory.push(newEntry);
    res.status(201).json(newEntry);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
