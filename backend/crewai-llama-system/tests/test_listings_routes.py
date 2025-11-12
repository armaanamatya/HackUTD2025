import unittest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routers.listings import router as listings_router


class TestListingsRoutes(unittest.TestCase):
    def setUp(self):
        self.app = FastAPI()
        self.app.include_router(listings_router)
        self.client = TestClient(self.app)

    def test_listings_returns_503_when_db_disconnected(self):
        r = self.client.get("/listings?limit=100")
        self.assertEqual(r.status_code, 503)
        self.assertIn("detail", r.json())

    def test_listings_search_503_when_db_disconnected(self):
        r = self.client.post("/listings/search", json={"query": "Austin"})
        self.assertEqual(r.status_code, 503)

    def test_listings_stats_503_when_db_disconnected(self):
        r = self.client.get("/listings/stats")
        self.assertEqual(r.status_code, 503)


if __name__ == "__main__":
    unittest.main()
