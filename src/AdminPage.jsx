import React, { useEffect, useState } from 'react';
import './AdminPage.css';

const AdminPage = () => {
    const [ports, setPorts] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [selectedPort, setSelectedPort] = useState(''); 

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

    return (
        <div className="admin-container">
            <h1>PANEL ADMINA</h1>
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
                    {}
                    <label htmlFor="port-select" style={{marginTop: "50px"}}>Wybierz port, w którym znajduje się czujnik: (prolific)</label>
                    <select id="port-select" value={selectedPort} onChange={handlePortChange}>
                        {ports.map((port, index) => (
                            <option key={index} value={port.path}>
                                {port.friendlyName}
                            </option>
                        ))}
                    </select>

                    {}
                </>
            )}
        </div>
    );
};

export default AdminPage;