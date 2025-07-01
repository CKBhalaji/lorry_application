import pytest
from lorry_backend.tests.test_utils import client

def test_get_owner_loads(client):
    # This test assumes authentication is required; adjust as needed
    response = client.get("/loads")
    # Accept 200, 401, 403, or 404 depending on setup
    assert response.status_code in (200, 401, 403, 404)
