# RailPulse System Architecture

RailPulse is a highly scalable, event-driven system designed to predict and distribute real-time train ETAs. It comprises three independent services to handle the complexities of data ingestion, Machine Learning predictions, and real-time client updates.

## High-Level Diagram

```mermaid
graph TD
    subgraph "Frontend Layer (React + Vite)"
        PV[Passenger View]
        SB[Station Display Board]
        CR[Control Room Dashboard]
    end

    subgraph "Backend Layer (Node.js + Express)"
        SE[Simulation Engine]
        API[REST API endpoints]
        WS[Socket.IO Server]
        DI[Delay Injector]
    end

    subgraph "Data Layer"
        DB[(In-Memory MongoDB)]
    end

    subgraph "Intelligence Layer (Python + FastAPI)"
        ML[Gradient Boosting Regressor]
        FE[Feature Engineering]
        SYN[Synthetic Data Gen]
    end

    %% Client to Server
    PV <-->|Socket.IO (Live Updates)| WS
    SB <-->|Socket.IO (Live Updates)| WS
    CR <-->|Socket.IO (Live Updates)| WS
    PV -->|HTTP GET| API
    SB -->|HTTP GET| API
    CR -->|HTTP GET| API

    %% Server Internal
    API --> DB
    SE --> DB
    SE --> WS
    DI --> SE

    %% Server to ML
    SE -->|POST /predict| ML
    ML -->|ETA + Confidence Interval + Factors| SE

    %% ML Internal
    SYN -->|CSV| FE
    FE --> ML
```

## Service Breakdown

### 1. React Client (Frontend)
- **Role:** Delivers specialized UI views for three distinct user personas.
- **Tech Stack:** React 18, Vite, Tailwind CSS, Recharts, Socket.IO Client.
- **Key Features:** Real-time timeline visualizations, delay trend charts, SVG-based physical network maps, and explainable AI insights.

### 2. Express Server (Backend)
- **Role:** Central orchestrator of the system. Runs the simulation, manages the state, and broadcasts updates.
- **Tech Stack:** Node.js, Express, Socket.IO, Mongoose, mongodb-memory-server.
- **Key Features:** 
  - **Simulation Engine:** Time-accelerated environment (e.g., 24x) interpolating train movements.
  - **Delay Injector:** Probabilistically injects real-world delays (signal failure, congestion, weather).
  - **Socket Server:** Emits 5-second ticks, train position updates, and delay events to clients.

### 3. ML Service (Intelligence)
- **Role:** Predicts delays at upcoming stations using historical patterns and current telemetry.
- **Tech Stack:** Python 3, FastAPI, Scikit-Learn, Pandas.
- **Key Features:**
  - **Predictive Engine:** Uses a robust Gradient Boosting Regressor (GBR).
  - **Confidence Intervals:** Utilizes Quantile Regression (alpha=0.05 and 0.95) to provide a 90% confidence window around ETAs.
  - **Explainability:** Calculates the top contributing features (e.g., cumulative delay, weather, congestion) for every prediction to build trust with end-users.
