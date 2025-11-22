from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Dict
import os

app = FastAPI(title="FloodGuard API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSV data
DATA_PATH = os.path.join(os.path.dirname(__file__), "../../data/segments.csv")
segments_df = pd.read_csv(DATA_PATH)


def calculate_risk_score(freeboard: float, state: int, history: int) -> int:
    """
    Calculate risk score based on:
    - freeboard < 0.5: 4 points
    - freeboard 0.5-1: 2 points
    - freeboard > 1: 0 points
    - state: adds state-1 points
    - history: adds 2 points if history == 2
    """
    score = 0
    
    # Freeboard scoring
    if freeboard < 0.5:
        score += 4
    elif freeboard <= 1.0:
        score += 2
    
    # State scoring (subtract 1 from state value)
    score += (state - 1)
    
    # History scoring
    if history == 2:
        score += 2
    
    return score


def get_risk_level(score: int) -> str:
    """
    Classify risk level based on score:
    - 0-2: low
    - 3-5: medium
    - 6+: high
    """
    if score <= 2:
        return "low"
    elif score <= 5:
        return "medium"
    else:
        return "high"


@app.get("/")
def read_root():
    return {"message": "FloodGuard API", "version": "1.0.0"}


@app.get("/segments")
def get_segments(scenario: str = Query("p1", description="Water level scenario: p10, p1, or p0_2")):
    """
    Get flood embankment segments with risk assessment for given scenario.
    
    Parameters:
    - scenario: Water level scenario (p10, p1, p0_2)
    
    Returns list of segments with risk scores and levels.
    """
    # Map scenario to column name
    water_column_map = {
        "p10": "water_p10",
        "p1": "water_p1",
        "p0_2": "water_p0_2"
    }
    
    if scenario not in water_column_map:
        return {"error": f"Invalid scenario. Must be one of: {', '.join(water_column_map.keys())}"}
    
    water_column = water_column_map[scenario]
    
    results = []
    for _, row in segments_df.iterrows():
        # Calculate freeboard (height_top - water_level)
        freeboard = row["height_top"] - row[water_column]
        
        # Calculate risk score
        risk_score = calculate_risk_score(freeboard, row["stan"], row["historia"])
        
        # Determine risk level
        risk_level = get_risk_level(risk_score)
        
        segment = {
            "id": int(row["id"]),
            "km": float(row["km"]),
            "state": int(row["stan"]),
            "history": int(row["historia"]),
            "height_top": float(row["height_top"]),
            "water_level": float(row[water_column]),
            "freeboard": round(freeboard, 2),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "coordinates": [
                [float(row["lat_start"]), float(row["lon_start"])],
                [float(row["lat_end"]), float(row["lon_end"])]
            ]
        }
        results.append(segment)
    
    return {
        "scenario": scenario,
        "segments": results
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
