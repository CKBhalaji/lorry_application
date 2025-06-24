import pytest
from fastapi.testclient import TestClient
from ..main import app # Assuming main.py contains your FastAPI app
from ..database import get_db, TestingSessionLocal # From test_auth.py setup
from ..models import User, UserRole
from ..security import get_password_hash # For creating an admin user directly

# client should be the one configured in test_auth.py with the overridden DB
# This assumes test_auth.py and test_admin.py are run in the same pytest session
# or client is re-configured similarly if run separately.
# For simplicity, we can re-import the client from test_auth
from .test_auth import client, clear_users_table # Import client and clear_users_table fixture

# Fixture to create an admin user and get a token
@pytest.fixture(scope='module') # Scope to module as admin user can persist across tests in this file
def admin_auth_token():
    db = TestingSessionLocal()

    # Clear existing admin if it was created by a previous module run and not cleaned up
    existing_admin = db.query(User).filter(User.email == 'testadmin@example.com').first()
    if existing_admin:
        db.delete(existing_admin)
        db.commit()

    # Create an admin user directly in the DB for testing admin routes
    admin_user = User(
        username='testadmin',
        email='testadmin@example.com',
        hashed_password=get_password_hash('adminpass'),
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    # Log in as admin to get token
    response = client.post(
        '/api/auth/login',
        data={'username': 'testadmin@example.com', 'password': 'adminpass'}
    )
    assert response.status_code == 200, response.text
    token = response.json()['access_token']

    yield token # Provide the token to tests

    # Teardown: remove the admin user after tests in this module are done
    db.delete(admin_user)
    db.commit()
    db.close()


def test_get_all_users_as_admin(admin_auth_token, clear_users_table): # clear_users_table to ensure clean state
    # The admin_auth_token fixture creates an admin.
    # We might want another user to be listed. Let's create one.
    client.post(
        '/api/auth/signup/driver',
        json={
            'username': 'anotherdriver',
            'email': 'anotherdriver@example.com',
            'password': 'password123',
            'role': 'driver',
            'profile': {}
        }
    )

    response = client.get(
        '/api/admin/users',
        headers={'Authorization': f'Bearer {admin_auth_token}'}
    )
    assert response.status_code == 200, response.text
    users_list = response.json()
    assert isinstance(users_list, list)
    # We expect at least the admin ('testadmin') and 'anotherdriver'
    # The exact number can be tricky if tests run in parallel or state isn't perfectly managed.
    # For this setup, with clear_users_table (function scope) and module-scoped admin,
    # we should have at least the admin created by fixture and one user by this test.
    # However, admin_auth_token is module scoped, so 'testadmin' persists.
    # clear_users_table (function scope) runs before this test, clearing previous function's users.

    found_admin = any(u['username'] == 'testadmin' for u in users_list)
    found_driver = any(u['username'] == 'anotherdriver' for u in users_list)
    assert found_admin
    assert found_driver


def test_get_all_users_as_non_admin(clear_users_table): # clear_users_table for clean state
    # Create and login as a driver
    signup_response = client.post(
        '/api/auth/signup/driver',
        json={
            'username': 'nonadmin_driver',
            'email': 'nonadmin_driver@example.com',
            'password': 'password',
            'role': 'driver', # Role must be specified
            'profile': {'phone_number': '1230984567'}
        }
    )
    assert signup_response.status_code == 201, signup_response.text

    login_response = client.post(
        '/api/auth/login',
        data={'username': 'nonadmin_driver@example.com', 'password': 'password'}
    )
    assert login_response.status_code == 200, login_response.text
    driver_token = login_response.json()['access_token']

    response = client.get(
        '/api/admin/users',
        headers={'Authorization': f'Bearer {driver_token}'}
    )
    assert response.status_code == 403 # Forbidden for non-admin
    assert response.json()['detail'] == 'Not authorized to perform this action'
