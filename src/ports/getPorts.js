import express from 'express';
import cors from 'cors';
import { SerialPort } from 'serialport';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/ports/api', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    const filteredPorts = ports.filter(port => 
      port.path.startsWith('COM') || port.path.startsWith('LPT')
    );
    res.json(filteredPorts);
  } catch (error) {
    console.error('Błąd podczas pobierania portów:', error);
    res.status(500).send('Błąd podczas pobierania portów');
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
