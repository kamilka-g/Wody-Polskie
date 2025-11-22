# FloodGuard Development Guide

## Quick Start

### Option 1: Using convenience scripts
```bash
# Terminal 1 - Start backend
./start-backend.sh

# Terminal 2 - Start frontend
./start-frontend.sh
```

### Option 2: Manual start
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── app/
│   │   └── main.py      # API endpoints and risk calculation
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.js      # Main React component with Leaflet map
│   │   ├── App.css     # Styling
│   │   └── index.js    # React entry point
│   └── package.json    # Node dependencies
└── data/
    └── segments.csv    # Sample flood embankment data
```

## API Endpoints

### GET /
Returns API info
```json
{
  "message": "FloodGuard API",
  "version": "1.0.0"
}
```

### GET /segments?scenario={p10|p1|p0_2}
Returns flood embankment segments with risk assessment

**Parameters:**
- `scenario` (required): Water level scenario
  - `p10`: 10% probability (least severe)
  - `p1`: 1% probability (moderate)
  - `p0_2`: 0.2% probability (most severe)

**Response:**
```json
{
  "scenario": "p1",
  "segments": [
    {
      "id": 1,
      "km": 0.0,
      "state": 2,
      "history": 0,
      "height_top": 5.2,
      "water_level": 4.2,
      "freeboard": 1.0,
      "risk_score": 3,
      "risk_level": "medium",
      "coordinates": [[52.2297, 21.0122], [52.2317, 21.0145]]
    }
  ]
}
```

## Risk Calculation Logic

### Risk Score Formula
```
score = freeboard_points + state_points + history_points

Where:
- freeboard_points:
  * < 0.5m: 4 points
  * 0.5-1.0m: 2 points
  * > 1.0m: 0 points
- state_points: state - 1
- history_points: 2 if history == 2, else 0
```

### Risk Level Classification
- **Low** (green): score 0-2
- **Medium** (yellow): score 3-5
- **High** (red): score 6+

## Data Format

CSV columns:
- `id`: Segment identifier
- `km`: Kilometer marker along embankment
- `stan`: State condition (1-3, higher = worse)
- `historia`: Historical issues (0-2, 2 = past problems)
- `height_top`: Embankment height (meters)
- `water_p10`: Water level for P10 scenario (meters)
- `water_p1`: Water level for P1 scenario (meters)
- `water_p0_2`: Water level for P0.2 scenario (meters)
- `lat_start`, `lon_start`: Start coordinates
- `lat_end`, `lon_end`: End coordinates

## Testing

### Backend Tests
```bash
cd backend
# Test all scenarios
curl "http://localhost:8000/segments?scenario=p10"
curl "http://localhost:8000/segments?scenario=p1"
curl "http://localhost:8000/segments?scenario=p0_2"
```

### Frontend
1. Open http://localhost:3000
2. Use the scenario selector dropdown
3. Click on colored segments to see details
4. Verify the risk level legend matches segment colors

## Adding New Data

To add more embankment segments, edit `data/segments.csv`:
1. Add new row with required columns
2. Ensure coordinates form a line segment
3. Restart backend to reload data

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### CORS errors
- Ensure backend is running on port 8000
- Check browser console for specific error
- CORS is enabled for all origins in development

### Map tiles not loading
- Map tiles are provided by OpenStreetMap
- If tiles fail to load, the map will still show segments
- Check internet connection
