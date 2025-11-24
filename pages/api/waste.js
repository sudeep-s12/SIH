let wasteData = [
  { id: 1, type: 'Flower', quantity: 100, collectedDate: new Date() },
  { id: 2, type: 'Garland', quantity: 50, collectedDate: new Date() },
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(wasteData);
  } else if (req.method === 'POST') {
    const newEntry = { ...req.body, id: wasteData.length + 1, collectedDate: new Date() };
    wasteData.push(newEntry);
    res.status(201).json(newEntry);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
