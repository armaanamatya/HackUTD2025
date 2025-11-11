<div align="center">

<img src="asset/Hackutd2025winner.jpg" alt="HackUTD 2025 Winner" width="820" />

# Cura

Winner of [HackUTD](https://devpost.com/software/tbd-58ftpr) 2025

**Commercial Real Estate Intelligence — Forecasting, insights, and market sentiment**

[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![CrewAI](https://img.shields.io/badge/CrewAI-latest-111111?logo=apache&logoColor=white)](https://github.com/crewAIInc/crewAI)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-0.38-3C3C3C?logo=python&logoColor=white)](https://www.uvicorn.org/)

</div>

Cura is a commercial real estate intelligence platform that delivers forecasting, analytical insights, pros and cons analysis, and market sentiment. It helps users evaluate opportunities, assess risks, and understand how properties align with their financial goals through data-driven comparisons and real-time trends. Real estate should be open, simple, and accessible to everyone—agentic analytics turn market data into actionable insight.

## Features
- Forecasting and analytical insights across commercial properties
- Property comparisons and pros/cons analysis
- Market sentiment and trends
- Reasoning-based layout engine for contextual UI
- Real-time dashboards powered by agentic workflows

## Architecture
- Backend: Python, FastAPI, CrewAI, Llama 3.1 (local via Ollama or vLLM) with optional Gemini fallback
- Data: MongoDB Atlas for listings and analytics storage
- Frontend: Next.js (apps in `frontend/` and `cura/`)
- Agents: Property Insights and Report Generation crews with web/file tools

## Quick Start

Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas connection string
- LLM provider configured via environment variables

Backend
```sh
# Create env and install
python -m venv .venv
source .venv/bin/activate
pip install -r backend/crewai-llama-system/requirements.txt

# Configure environment
cp backend/crewai-llama-system/.env.example backend/crewai-llama-system/.env
# Edit backend/crewai-llama-system/.env with keys and model settings

# Run API server
python backend/crewai-llama-system/start_server.py
# Open FastAPI docs at http://localhost:8000/docs
```

Frontend (choose one)
```sh
# From ./frontend
npm install
npm run dev
# or from ./cura
npm install
npm run dev
```

## Repository Structure
- `backend/crewai-llama-system`: FastAPI server, CrewAI agents, MongoDB integration
- `frontend`: Next.js app
- `cura`: Next.js app as referenced on Devpost
- `parser`: OCR and property data parsing utilities

## Acknowledgments
Built for the CBRE Challenge at HackUTD 2025.

