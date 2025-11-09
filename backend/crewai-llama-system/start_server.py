#!/usr/bin/env python3

import uvicorn

if __name__ == "__main__":
    print("Starting CrewAI FastAPI Server...")
    print("API Documentation available at: http://localhost:8000/docs")
    print("Server running at: http://localhost:8000")
    print("Press Ctrl+C to stop")
    
    uvicorn.run(
        "api_server:app", 
        host="0.0.0.0", 
        port=8000,
        reload=False,  # Disabled due to Python 3.13 compatibility issue with watchfiles
        log_level="info"
    )