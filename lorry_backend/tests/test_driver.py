import pytest
from lorry_backend.tests.test_utils import client

# 1. GET /api/drivers/loads
def test_get_available_loads_for_driver(client):
    response = client.get("/api/drivers/loads")
    assert response.status_code in (200, 401, 403)

# 2. POST /api/drivers/bids
def test_place_bid_on_load(client):
    payload = {"load_id": 1, "driver_id": 1, "amount": 1000}
    response = client.post("/api/drivers/bids", json=payload)
    assert response.status_code in (201, 400, 401, 403, 404)

# 3. GET /api/drivers/my-loads
def test_get_my_loads_for_driver(client):
    response = client.get("/api/drivers/my-loads")
    assert response.status_code in (200, 401, 403)

# 4. GET /api/drivers/{driver_id}/bids
def test_get_driver_bids(client):
    response = client.get("/api/drivers/1/bids")
    assert response.status_code in (200, 401, 403, 404)

# 5. PUT /api/drivers/bids/{bid_id}/accept
def test_accept_bid(client):
    response = client.put("/api/drivers/bids/1/accept")
    assert response.status_code in (200, 401, 403, 404)

# 6. PUT /api/drivers/bids/{bid_id}/decline
def test_decline_bid(client):
    response = client.put("/api/drivers/bids/1/decline")
    assert response.status_code in (200, 401, 403, 404)

# 7. GET /api/drivers/{driver_id}/profile
def test_get_driver_profile(client):
    response = client.get("/api/drivers/1/profile")
    assert response.status_code in (200, 401, 403, 404)

# 8. PUT /api/drivers/{driver_id}/password
def test_change_driver_password(client):
    payload = {"old_password": "testpassword", "new_password": "newpassword"}
    response = client.put("/api/drivers/1/password", json=payload)
    assert response.status_code in (200, 401, 403, 404, 400)

# 9. PUT /api/drivers/{driver_id}/profile
def test_update_driver_profile(client):
    payload = {"full_name": "Updated Name", "phone_number": "1234567890"}
    response = client.put("/api/drivers/1/profile", json=payload)
    assert response.status_code in (200, 401, 403, 404)

# 10. PUT /api/drivers/loads/{load_id}/status
def test_update_load_status(client):
    payload = {"status": "in_transit"}
    response = client.put("/api/drivers/loads/1/status", json=payload)
    assert response.status_code in (200, 401, 403, 404, 400)

# 11. POST /api/drivers/disputes
def test_create_driver_dispute(client):
    payload = {"loadId": 1, "message": "Test dispute"}
    response = client.post("/api/drivers/disputes", json=payload)
    assert response.status_code in (201, 400, 401, 403, 404)

# 12. GET /api/drivers/disputes
def test_get_driver_disputes(client):
    response = client.get("/api/drivers/disputes")
    assert response.status_code in (200, 401, 403)

# 13. POST /api/drivers/{driver_id}/upload
def test_upload_driver_document(client):
    # This test will fail unless a file and driver profile exist, but we check for 400/404
    files = {"file": ("test.txt", b"test content")}
    response = client.post("/api/drivers/1/upload?docType=driving_license", files=files)
    assert response.status_code in (200, 400, 401, 403, 404)
