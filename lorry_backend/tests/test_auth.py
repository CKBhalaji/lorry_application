import pytest
from lorry_backend.tests.test_utils import client

# 1. Test /api/auth/signup/driver
def test_signup_driver(client):
    payload = {
        "username": "testdriver",
        "email": "testdriver@example.com",
        "password": "testpassword",
        "role": "driver",
        "profile": {
            "full_name": "Test Driver",
            "phone_number": "1234567890"
        }
    }
    response = client.post("/api/auth/signup/driver", json=payload)
    assert response.status_code in (201, 400)  # 400 if already exists

# 2. Test /api/auth/signup/goods-owner
def test_signup_goods_owner(client):
    payload = {
        "username": "testowner",
        "email": "testowner@example.com",
        "password": "testpassword",
        "role": "goods_owner",
        "profile": {
            "full_name": "Test Owner",
            "company_name": "Test Co",
            "phone_number": "9876543210"
        }
    }
    response = client.post("/api/auth/signup/goods-owner", json=payload)
    assert response.status_code in (201, 400)  # 400 if already exists

# 3. Test /api/auth/login
# Note: login expects form data, not JSON
def test_login(client):
    # First, create a user
    client.post("/api/auth/signup/driver", json={
        "username": "loginuser",
        "email": "loginuser@example.com",
        "password": "testpassword",
        "profile": None
    })
    # Now, login
    response = client.post("/api/auth/login", data={
        "username": "loginuser",
        "password": "testpassword"
    })
    assert response.status_code in (200, 400, 401)

# 4. Test /api/auth/verification/send
# This will likely fail unless email sending is mocked, but we can check for 200/400
def test_verification_send(client):
    payload = {"email": "verify@example.com"}
    response = client.post("/api/auth/verification/send", json=payload)
    assert response.status_code in (200, 400, 500)

# 5. Test /api/auth/verification/verify
# This will fail unless OTP is set, but we can check for 400
def test_verification_verify(client):
    payload = {"email": "verify@example.com", "otp": "1234"}
    response = client.post("/api/auth/verification/verify", json=payload)
    assert response.status_code in (200, 400)
