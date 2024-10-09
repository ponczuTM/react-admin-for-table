import React, { useEffect, useState } from 'react';
import './AdminPage.css';
import 'boxicons';

const AdminPage = () => {
    const [ports, setPorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPort, setSelectedPort] = useState('');
    const [isChairsPushedIn, setIsChairsPushedIn] = useState(false);
    const [sensorData, setSensorData] = useState(null);
    const [minDistance, setMinDistance] = useState(null);
    const [calibrated, setCalibrated] = useState(false);
    const [showChairsSection, setShowChairsSection] = useState(false);
    const [showCalibrateButton, setShowCalibrateButton] = useState(false);
    const [showArrow, setShowArrow] = useState(false);

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
        setShowCalibrateButton(true);
    };

    const handleCalibrate = async () => {
        try {
            const response = await fetch('http://localhost:3000/sensors/api');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSensorData(data.sensors);

            const distances = data.sensors.map(sensor => sensor.distance);
            const min = Math.min(...distances);
            setMinDistance(min);

            setCalibrated(true);

            await sendCalibrationData(min, selectedPort);

        } catch (error) {
            console.error('Error fetching sensor data:', error);
        }
    };

    const sendCalibrationData = async (minDistance, selectedPort) => {
        try {
            const response = await fetch('http://localhost:3000/calibration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    minDistance,
                    port: selectedPort,
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Calibration data sent successfully');
        } catch (error) {
            console.error('Error sending calibration data:', error);
        }
    };

    const handleNextClick = () => {
        setShowChairsSection(true);
        handleCalibrate();
        setShowArrow(true);
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
                    <button className="calibrate-btn" onClick={handleNextClick}>
                        Dalej
                    </button>

                    {showArrow && (
                        <div className="arrow" style={{ animation: 'moveArrow 0.5s infinite alternate' }}>
                            <svg fill="#fdc00a" height="70px" width="70px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-2.59 -2.59 31.11 31.11" xml:space="preserve" stroke="#000000" stroke-width="0.0002593" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="c118_triangle"> <path d="M25.397,4.554h-2.042l-9.974,12.644c-0.101,0.124-0.256,0.197-0.416,0.197c-0.164,0-0.315-0.073-0.419-0.197L2.575,4.554 H0.532c-0.206,0-0.392,0.115-0.479,0.299c-0.09,0.184-0.064,0.403,0.06,0.561l12.435,15.762c0.104,0.125,0.255,0.2,0.419,0.2 c0.16,0,0.315-0.075,0.416-0.2L25.816,5.413c0.128-0.157,0.148-0.377,0.058-0.561C25.789,4.669,25.601,4.554,25.397,4.554z"></path> </g> <g id="Capa_1_184_"> </g> </g> </g></svg>
                        </div>
                    )}

                    {showChairsSection && (
                        <>
                            <h1 style={{ marginTop: "100px", zIndex: "999" }}>ZASUŃ KRZESŁA</h1>
                            <div className="table">
                                <div className="chair top-left"></div>
                                <div className="chair top-right"></div>
                                <div className="chair bottom-left"></div>
                                <div className="chair bottom-right"></div>
                                <div className="coverTable"></div>
                            </div>
                            <div style={{ marginTop: "100px" }}></div>
                            {!isChairsPushedIn ? (
                                <button className="chairs-btn" onClick={handleChairsPushedIn}>
                                    Krzesła zostały zasunięte
                                </button>
                            ) : (
                                <>
                                    {showCalibrateButton && (
                                        <button className="calibrate-btn" onClick={handleCalibrate}>
                                            Kalibruj
                                        </button>
                                    )}
                                    {calibrated && (
                                        <div style={{ marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                                            Najmniejszy dystans: {minDistance}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage;