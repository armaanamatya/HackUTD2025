from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routes.config import router as config_router

def test_config_routes():
    app = FastAPI()
    app.include_router(config_router)
    client = TestClient(app)
    r1 = client.get("/")
    assert r1.status_code == 200
    r2 = client.get("/config")
    assert r2.status_code == 200
    assert "llm_config" in r2.json()
