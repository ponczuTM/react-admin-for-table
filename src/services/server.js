import express from 'express';
import cors from 'cors';
import { SerialPort } from 'serialport';
import WebSocket from 'ws';  // Import WebSocket library

const app = express();
const port = 3000;
let changeTimer = null;
let distanceArray_1 = [];
let distanceArray_2 = [];
let distanceArray_3 = [];
let distanceArray_4 = [];

app.use(cors());
app.use(express.json());

let controller_port_number = 0;
let buffer = '';
let distances = {
    sensor_1: { distance: 175, isSitTaken: false },
    sensor_2: { distance: 175, isSitTaken: false },
    sensor_3: { distance: 175, isSitTaken: false },
    sensor_4: { distance: 175, isSitTaken: false },
};

let changesCount = 0;
let timerRunning = false;

let portName = '';
const baudRate = 115200;
let serialPort; 

const wss = new WebSocket.Server({ noServer }); // Create WebSocket Server
let clients = new Set(); // Keep track of connected clients

const formatData = (data) => {
    return data.split('').map(char => `[${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}]`).join('');
};

const processData = (data) => {
    const distanceMapping = {
        "[Dz=AB]": 5,
        "[Dz=01]": 17,
        "[Dz=02]": 37,
        "[Dz=03]": 62,
        "[Dz=04]": 87,
        "[Dz=05]": 112,
        "[Dz=06]": 137,
        "[Dz=07]": 160,
        "[Dz=XX]": 175,
    };

    const distance = distanceMapping[data] || 0;

    if (controller_port_number === 1) {
        updateSensorState('sensor_1', distance);
    }
    if (controller_port_number === 2) {
        updateSensorState('sensor_2', distance);
    }
    if (controller_port_number === 3) {
        updateSensorState('sensor_3', distance);
    }
    if (controller_port_number === 4) {
        updateSensorState('sensor_4', distance);
    }

    if (!timerRunning) {
        changesCount = 0;
        timerRunning = true;
        changeTimer = setTimeout(() => {
            console.log(`Liczba zmian wykrytych w ciągu 2 sekundy: ${changesCount}`);
            timerRunning = false;
            changesCount = 0;
            console.log(distanceArray_1);
            console.log("SIZE: ", distanceArray_1.length);
            distanceArray_1 = [];
            console.log(distanceArray_2);
            console.log("SIZE: ", distanceArray_2.length);
            distanceArray_2 = [];
            console.log(distanceArray_3);
            console.log("SIZE: ", distanceArray_3.length);
            distanceArray_3 = [];
            console.log(distanceArray_4);
            console.log("SIZE: ", distanceArray_4.length);
            distanceArray_4 = [];
        }, 3000);
    }

    changesCount++;
};

const updateSensorState = (sensor, distance) => {
    const previousState = distances[sensor].isSitTaken; // Store previous state
    distances[sensor].distance = distance;
    console.log("Distance: ", distance);
    clearTimeout(distances[sensor].timeout);
    if (controller_port_number == 1) distanceArray_1.push(distance);
    if (controller_port_number == 2) distanceArray_2.push(distance);
    if (controller_port_number == 3) distanceArray_3.push(distance);
    if (controller_port_number == 4) distanceArray_4.push(distance);

    if (distance < 40) {
        distances[sensor].timeout = setTimeout(() => {
            if (distances[sensor].distance < 40) {
                distances[sensor].isSitTaken = true;
                notifyClients(); // Notify clients when flag changes
            }
        }, 2000);
    } else {
        distances[sensor].timeout = setTimeout(() => {
            if (distances[sensor].distance > 40) {
                distances[sensor].isSitTaken = false;
                notifyClients(); // Notify clients when flag changes
            }
        }, 4000);
    }

    // Notify only if the state has changed
    if (distances[sensor].isSitTaken !== previousState) {
        notifyClients(); // Send state to all connected clients
    }
};

const notifyClients = () => {
    const allSitTaken = Object.values(distances).every(sensor => sensor.isSitTaken);
    const message = JSON.stringify({ playAds: !allSitTaken });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

const startSerialPort = () => {
    serialPort = new SerialPort({
        path: portName,
        baudRate: baudRate,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false,
    });

    serialPort.on('data', (data) => {
        buffer += data.toString();

        if (buffer.includes('\r\n')) {
            const data = buffer;
            const formattedRawData = formatData(data);
            console.log(data);
            console.log(formattedRawData);
            const dataArray = formattedRawData.match(/\[([A-Fa-f0-9]{2})\]/g);
            if (dataArray && dataArray.length >= 4) {
                const port_id = dataArray?.[3]?.slice(1, -1);
                if (port_id === "31") controller_port_number = 1;
                if (port_id === "32") controller_port_number = 2;
                if (port_id === "33") controller_port_number = 3;
                if (port_id === "34") controller_port_number = 4;
            } else {
                console.log('No port ID found');
            }

            let startIdx = buffer.indexOf('[Dz=');
            let endIdx = buffer.indexOf(']');

            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                const fullPacket = buffer.substring(startIdx, endIdx + 1);
                processData(fullPacket);
            }

            buffer = '';
        }
    });

    serialPort.on('error', (err) => {
        console.error('Error:', err.message);
    });

    serialPort.on('open', () => {
        console.log('Serial Port Opened');
    });
};

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Upgrade server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        clients.add(ws); // Add new client to the set
        ws.on('close', () => {
            clients.delete(ws); // Remove client from the set on disconnect
        });
    });
});

app.get('/sensors/api', (req, res) => {
    res.json({
        sensors: [
            { name: 'sensor_1', distance: distances.sensor_1.distance, isSitTaken: distances.sensor_1.isSitTaken },
            { name: 'sensor_2', distance: distances.sensor_2.distance, isSitTaken: distances.sensor_2.isSitTaken },
            { name: 'sensor_3', distance: distances.sensor_3.distance, isSitTaken: distances.sensor_3.isSitTaken },
            { name: 'sensor_4', distance: distances.sensor_4.distance, isSitTaken: distances.sensor_4.isSitTaken }
        ]
    });
});

app.post('/calibration', (req, res) => {
    const { minDistance, port } = req.body;
    console.log(`Received calibration data - Minimum Distance: ${minDistance}, Selected Port: ${port}`);
    portName = port; 

    startSerialPort();

    res.status(200).send('Calibration data received successfully');
});
