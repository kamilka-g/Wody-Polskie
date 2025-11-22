#!/bin/bash
# Start FloodGuard Backend

cd "$(dirname "$0")/backend"
echo "Starting FloodGuard Backend on http://localhost:8000"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
