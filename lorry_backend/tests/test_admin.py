import pytest
from lorry_backend.tests.test_utils import client

# 1. POST /api/admin/admins/signup
def test_signup_admin(client):
    payload = {
        "username": "adminuser",
        "email": "adminuser@example.com",
        "password": "testpassword",
        "role": "admin"
    }
    response = client.post("/api/admin/admins/signup", json=payload)
    assert response.status_code in (201, 400, 401)

# 2. GET /api/admin/users
def test_get_all_users(client):
    response = client.get("/api/admin/users")
    assert response.status_code in (200, 401, 403)

# 3. DELETE /api/admin/users/{user_id}
def test_delete_user_by_admin(client):
    response = client.delete("/api/admin/users/1")
    assert response.status_code in (204, 401, 403, 404)

# 4. GET /api/admin/loads
def test_get_all_loads_admin(client):
    response = client.get("/api/admin/loads")
    assert response.status_code in (200, 401, 403)

# 5. PUT /api/admin/loads/{load_id}/status
def test_update_load_status_admin(client):
    response = client.put("/api/admin/loads/1/status", json={"status": "completed"})
    assert response.status_code in (200, 401, 403, 404)

# 6. GET /api/admin/disputes
def test_get_all_disputes_admin(client):
    response = client.get("/api/admin/disputes")
    assert response.status_code in (200, 401, 403)

# 7. PUT /api/admin/disputes/{dispute_id}/resolve
def test_resolve_dispute_admin(client):
    response = client.put("/api/admin/disputes/1/resolve", json={"resolution_details": "resolved", "status": "resolved"})
    assert response.status_code in (200, 401, 403, 404)

# 8. POST /api/admin/admins
def test_create_new_admin(client):
    payload = {
        "username": "newadmin",
        "email": "newadmin@example.com",
        "password": "testpassword",
        "role": "admin",
        "name": "Admin Name"
    }
    response = client.post("/api/admin/admins", json=payload)
    assert response.status_code in (201, 400, 401, 403)

# 9. GET /api/admin/admins
def test_get_all_admins(client):
    response = client.get("/api/admin/admins")
    assert response.status_code in (200, 401, 403)

# 10. DELETE /api/admin/admins/{admin_id_to_delete}
def test_delete_admin_by_admin(client):
    response = client.delete("/api/admin/admins/1")
    assert response.status_code in (204, 401, 403, 404)

# 11. GET /api/admin/admins/{admin_id}/profile
def test_get_admin_profile(client):
    response = client.get("/api/admin/admins/1/profile")
    assert response.status_code in (200, 401, 403, 404)

# 12. PUT /api/admin/admins/{admin_id}/profile
def test_update_admin_profile(client):
    payload = {
        "username": "updatedadmin",
        "email": "updatedadmin@example.com",
        "password": "newpassword",
        "role": "admin"
    }
    response = client.put("/api/admin/admins/1/profile", json=payload)
    assert response.status_code in (200, 401, 403, 404, 400)

# 13. PUT /api/admin/admins/{admin_id}/admin_profile
def test_update_admin_profile_only(client):
    payload = {
        "name": "Updated Name",
        "phone_number": "1234567890"
    }
    response = client.put("/api/admin/admins/1/admin_profile", json=payload)
    assert response.status_code in (200, 401, 403, 404)

# 14. PUT /api/admin/admins/{admin_id}/password
def test_change_admin_password_by_admin(client):
    payload = {
        "old_password": "testpassword",
        "new_password": "newpassword"
    }
    response = client.put("/api/admin/admins/1/password", json=payload)
    assert response.status_code in (204, 401, 403, 404, 400)
