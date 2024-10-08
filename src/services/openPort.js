// openPort.js
import express from 'express'; // użyj importu zamiast require
import cors from 'cors'; // użyj importu zamiast require

const app = express();
const PORT = 3002; // Używamy portu 3002

app.use(cors());
app.use(express.json()); // Middleware do parsowania JSON

// Endpoint do odbierania minimalnej wartości dystansu
app.post('/api/set-min-distance', (req, res) => {
    const { distance } = req.body;
    console.log('Otrzymana minimalna odległość:', distance);
    res.status(200).json({ message: 'Dystans zapisany', distance: distance });
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer mikroserwisu działa na http://localhost:${PORT}`);
});
