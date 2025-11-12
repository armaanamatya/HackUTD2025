import unittest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routers.config import router as config_router


class TestHealthRoutes(unittest.TestCase):
    def setUp(self):
        self.app = FastAPI()
        self.app.include_router(config_router)
        self.client = TestClient(self.app)

    def test_root_ok(self):
        r = self.client.get("/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("endpoints", r.json())

    def test_config_ok(self):
        r = self.client.get("/config")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("llm_config", data)
        self.assertIn("status", data)

    def test_healthz_flag(self):
        r = self.client.get("/healthz")
        self.assertEqual(r.status_code, 200)
        self.assertIn("db_connected", r.json())


if __name__ == "__main__":
    unittest.main()
