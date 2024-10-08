import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

const sensorData = {
    sensors: [
        {
            name: "sensor_1",
            distance: 175,
            isSitTaken: false
        },
        {
            name: "sensor_2",
            distance: 175,
            isSitTaken: false
        },
        {
            name: "sensor_3",
            distance: 175,
            isSitTaken: false
        },
        {
            name: "sensor_4",
            distance: 37,
            isSitTaken: true
        }
    ]
};

app.get('/sensors/api', (req, res) => {
    res.json(sensorData);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
