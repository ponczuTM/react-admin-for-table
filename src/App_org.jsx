import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/sensors/api');
        setDistance(response.data.sensors[0].distance);
        setError(null); 
      } catch (err) {
        setError('Błąd w pobieraniu danych');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 200);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <h1>Odległość od czujnika:</h1>
      <div className="sensor-container">
        <div className="sensor">
          {loading ? (
            <p>Ładowanie...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <h2>{distance} cm</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;