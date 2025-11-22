# FloodGuard MVP

A flood embankment monitoring system with FastAPI backend and React/Leaflet frontend.

## Features

- **Backend (FastAPI)**: 
  - Loads flood embankment segment data from CSV
  - Calculates freeboard (height_top - water_level)
  - Computes risk scores based on freeboard, state, and history
  - API endpoint: `/segments?scenario={p10|p1|p0_2}`

- **Frontend (React + Leaflet)**:
  - Interactive map displaying flood embankment segments
  - Color-coded polylines based on risk level (low/medium/high)
  - Popup information for each segment
  - Scenario selector for different water level probabilities

## Risk Scoring

Risk score calculation:
- Freeboard < 0.5m: +4 points
- Freeboard 0.5-1m: +2 points
- Freeboard > 1m: 0 points
- State: +(state - 1) points
- History = 2: +2 points

Risk levels:
- **Low**: Score 0-2 (Green)
- **Medium**: Score 3-5 (Yellow)
- **High**: Score 6+ (Red)

## Setup and Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm start
```

The application will open at `http://localhost:3000`

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Endpoints

- `GET /` - API info
- `GET /segments?scenario={p10|p1|p0_2}` - Get segments with risk assessment

## Data Structure

CSV format (data/segments.csv):
- `id`: Segment identifier
- `km`: Kilometer marker
- `stan`: State (1-3)
- `historia`: History flag (0-2)
- `height_top`: Top height of embankment (m)
- `water_p10`: Water level for P10 scenario (m)
- `water_p1`: Water level for P1 scenario (m)
- `water_p0_2`: Water level for P0.2 scenario (m)
- `lat_start`, `lon_start`: Starting coordinates
- `lat_end`, `lon_end`: Ending coordinates
