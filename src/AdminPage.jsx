import React, { useEffect, useState } from 'react';
import './AdminPage.css';

const AdminPage = () => {
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPort, setSelectedPort] = useState('');
    const [isChairsPushedIn, setIsChairsPushedIn] = useState(false); 
    const [sensorData, setSensorData] = useState(null); 

    const fetchPorts = async () => {
        try {
            const response = await fetch('http://localhost:1000/ports/api');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPorts(data);
        } catch (error) {
            console.error('Error fetching the ports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPorts();
    }, []);

    useEffect(() => {
        if (ports.length > 0) {
            const prolificPort = ports.find(port => port.friendlyName.toLowerCase().includes("prolific"));
            if (prolificPort) {
                setSelectedPort(prolificPort.path);
            } else {
                setSelectedPort(ports[0].path);
            }
        }
    }, [ports]);

    const handlePortChange = (event) => {
        setSelectedPort(event.target.value);
    };

    const handleChairsPushedIn = () => {
        setIsChairsPushedIn(true); 
    };

    const handleCalibrate = async () => {
        try {
            const response = await fetch('http://localhost:3001/sensors/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sensors: [
                        { name: 'sensor_1', distance: 175, isSitTaken: false },
                        { name: 'sensor_2', distance: 175, isSitTaken: false },
                        { name: 'sensor_3', distance: 175, isSitTaken: false },
                        { name: 'sensor_4', distance: 37, isSitTaken: true },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSensorData(data.sensors); 
        } catch (error) {
            console.error('Error calibrating sensors:', error);
        }
    };

    return (
        <div className="admin-container">
            <h1 style={{ marginTop: "80px", fontSize: "50px" }}>PANEL ADMINA</h1>
            {loading ? (
                <p>Ładowanie danych...</p>
            ) : (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Port</th>
                                {ports.map((port, index) => (
                                    <th key={index}>{port.path}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Struktura systemowa</td>
                                {ports.map((port, index) => (
                                    <td key={index}>{port.manufacturer}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>Nazwa</td>
                                {ports.map((port, index) => (
                                    <td key={index}>{port.friendlyName}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <h1>Kalibracja stołu:</h1>
                    <h2 style={{ marginTop: "80px", zIndex: "999" }}>Wybierz port, w którym znajduje się czujnik (prolific):</h2>
                    <label htmlFor="port-select"></label>
                    <select id="port-select" value={selectedPort} onChange={handlePortChange}>
                        {ports.map((port, index) => (
                            <option key={index} value={port.path}>
                                {port.friendlyName}
                            </option>
                        ))}
                    </select>

                    <h1 style={{ marginTop: "100px", zIndex: "999" }}>ZASUŃ KRZESŁA</h1>
                    <div className="table">
                        <div className="chair top-left"></div>
                        <div className="chair top-right"></div>
                        <div className="chair bottom-left"></div>
                        <div className="chair bottom-right"></div>
                        <div className="coverTable"></div>
                    </div>

                    {!isChairsPushedIn ? (
                        <button className="chairs-btn" onClick={handleChairsPushedIn}>
                            Krzesła zostały zasunięte
                        </button>
                    ) : (
                        <button className="calibrate-btn" onClick={handleCalibrate}>
                            Kalibruj
                        </button>
                    )}

                    {}
                    {sensorData && (
                        <div className="sensor-data" style={{ marginTop: "20px" }}>
                            {sensorData.map(sensor => (
                                <p key={sensor.name}>
                                    WYKRYTY DYSTANS {sensor.name.toUpperCase()}: {sensor.distance}
                                </p>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage;