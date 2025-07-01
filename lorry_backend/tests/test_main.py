import pytest
from fastapi.testclient import TestClient
from lorry_backend.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Lorry backend is running and accessible"}
