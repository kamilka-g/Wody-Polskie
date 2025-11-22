import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [segments, setSegments] = useState([]);
  const [scenario, setScenario] = useState('p1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments(scenario);
  }, [scenario]);

  const fetchSegments = async (selectedScenario) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/segments?scenario=${selectedScenario}`);
      const data = await response.json();
      setSegments(data.segments || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
    setLoading(false);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return '#28a745'; // green
      case 'medium':
        return '#ffc107'; // yellow
      case 'high':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>FloodGuard - Flood Embankment Monitoring</h1>
        <div className="scenario-selector">
          <label>Water Level Scenario: </label>
          <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
            <option value="p10">P10 (10% probability)</option>
            <option value="p1">P1 (1% probability)</option>
            <option value="p0_2">P0.2 (0.2% probability)</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading segments...</div>
      ) : (
        <MapContainer
          center={[52.2377, 21.0237]}
          zoom={13}
          style={{ height: 'calc(100vh - 120px)', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {segments.map((segment) => (
            <Polyline
              key={segment.id}
              positions={segment.coordinates}
              color={getRiskColor(segment.risk_level)}
              weight={5}
              opacity={0.8}
            >
              <Popup>
                <div className="popup-content">
                  <h3>Segment #{segment.id}</h3>
                  <p><strong>Location:</strong> km {segment.km}</p>
                  <p><strong>Risk Level:</strong> <span className={`risk-${segment.risk_level}`}>{segment.risk_level.toUpperCase()}</span></p>
                  <p><strong>Risk Score:</strong> {segment.risk_score}</p>
                  <p><strong>Freeboard:</strong> {segment.freeboard}m</p>
                  <p><strong>Height:</strong> {segment.height_top}m</p>
                  <p><strong>Water Level:</strong> {segment.water_level}m</p>
                  <p><strong>State:</strong> {segment.state}</p>
                  <p><strong>History:</strong> {segment.history}</p>
                </div>
              </Popup>
            </Polyline>
          ))}
        </MapContainer>
      )}

      <div className="legend">
        <h4>Risk Levels</h4>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
          <span>Low Risk (Score 0-2)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
          <span>Medium Risk (Score 3-5)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
          <span>High Risk (Score 6+)</span>
        </div>
      </div>
    </div>
  );
}

export default App;
