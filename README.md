# RailMind 🚄

**Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains**  
*A smart prototype for SIH26028 (Ministry of Railways)*

RailMind replaces static railway timetables with continuously-updating, AI-predicted arrival times that self-correct in real-time as delays, weather, and congestion change along a train's route.

## 🚀 Setup Instructions (< 5 minutes)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start the ML Service
```bash
cd ml-service
python -m pip install -r requirements.txt
python src/generate_data.py
python src/train_model.py
python -m uvicorn src.predict:app --port 8000
```
*(Wait until it says `Application startup complete`)*

### 2. Start the Express Server
In a new terminal:
```bash
cd server
npm install
npm run dev
```
*(Wait until it says `Socket.IO ready`)*

### 3. Start the React Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
*(Open the provided localhost URL in your browser, typically `http://localhost:5173`)*

---

### Alternative: One-Click Start (Windows)
If you have all dependencies globally installed, simply right-click `start-all.ps1` and select "Run with PowerShell" from the project root.

## 💡 Judge Talking Points (Differentiators)

1. **Quantile Regression for Confidence Intervals:** We don't just provide a point-estimate ETA. Our model runs two additional quantile regressors (5th and 95th percentiles) to give passengers a mathematically sound **90% confidence window** (e.g., "ETA 14:30 ±8 min").
2. **Explainable AI (XAI):** Transparency builds trust. For every prediction, the ML service extracts the top contributing features (e.g., "42% due to Cumulative Delay, 28% due to Heavy Rain"). This is surfaced in the Control Room view as natural-language explanations.
3. **Live Simulation Engine:** To effectively demo a real-time system, we built a 24x accelerated physics simulation engine. It continuously interpolates GPS coordinates, probabilistically injects delays (signal failures, weather), and routes everything through Socket.IO.
4. **Three Distinct Personas:** We built a complete product ecosystem, not just a single view. The prototype features a mobile-friendly **Passenger View**, a high-contrast dark-mode **Station Display Board**, and an analytics-heavy **Control Room Dashboard**.
5. **No Cold Starts (Zero-Install DB):** To ensure a flawless hackathon presentation, the backend uses `mongodb-memory-server`. It seeds complex train schedules and stations dynamically in memory on startup, ensuring it runs reliably on any judge's machine without requiring a local database installation.
