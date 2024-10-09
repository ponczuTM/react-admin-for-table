// const express = require('express');
// const cors = require('cors');
// const { SerialPort } = require('serialport');

import express from 'express';
import cors from 'cors';
import { SerialPort } from 'serialport';

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

const formatData = (data) => {
    return data.split('').map(char => `[${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}]`).join('');
};

const processData = (data) => {
    const distanceMapping = {
        "[Dz=AB]": 5, // 0-10 cm
        "[Dz=01]": 17, // 10-25 cm
        "[Dz=02]": 37, // 25-50 cm
        "[Dz=03]": 62, // 50-75 cm
        "[Dz=04]": 87, // 75-100 cm
        "[Dz=05]": 112, // 100-125 cm
        "[Dz=06]": 137, // 125-150 cm
        "[Dz=07]": 160, // 150-170 cm
        "[Dz=XX]": 175, // 170+ cm
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
            }
        }, 2000);
    } else {
        distances[sensor].timeout = setTimeout(() => {
            if (distances[sensor].distance > 40) {
                distances[sensor].isSitTaken = false;
            }
        }, 4000);
    }
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});