import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AdminPage from './AdminPage';

const App = () => {
    const [sensors, setSensors] = useState([]);

    const fetchSensors = async () => {
        try {
            const response = await fetch('http://localhost:3000/sensors/api');
            const data = await response.json();
            setSensors(data.sensors);
        } catch (error) {
            console.error('Błąd podczas pobierania danych:', error);
        }
    };

    useEffect(() => {
        fetchSensors();
        const intervalId = setInterval(fetchSensors, 10);
        return () => clearInterval(intervalId); 
    }, []);

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={
                        <div>
                            <div className="row">
                                <div className={`seat ${sensors[0]?.isSitTaken ? 'occupied' : ''} ${sensors[0]?.isSitTaken ? 'flipped' : ''}`}>
                                    {sensors[0]?.isSitTaken ? 'Cześć, widzę że usiadłeś!' : ''}
                                </div>
                                <div className={`seat ${sensors[1]?.isSitTaken ? 'occupied' : ''} ${sensors[1]?.isSitTaken ? 'flipped' : ''}`}>
                                    {sensors[1]?.isSitTaken ? 'Cześć, widzę że usiadłeś!' : ''}
                                </div>
                            </div>
                            <div className="row">
                                <div className={`seat ${sensors[2]?.isSitTaken ? 'occupied' : ''}`}>
                                    {sensors[2]?.isSitTaken ? 'Cześć, widzę że usiadłeś!' : ''}
                                </div>
                                <div className={`seat ${sensors[3]?.isSitTaken ? 'occupied' : ''}`}>
                                    {sensors[3]?.isSitTaken ? 'Cześć, widzę że usiadłeś!' : ''}
                                </div>
                            </div>
                        </div>
                    } />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
