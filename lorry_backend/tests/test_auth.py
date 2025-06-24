import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..main import app # app from main.py
from ..database import Base, get_db
from ..models import User # Import User model
from ..config import settings


# Use a separate test database
SQLALCHEMY_DATABASE_URL_TEST = settings.DATABASE_URL + '_test' # Example: append _test

engine_test = create_engine(SQLALCHEMY_DATABASE_URL_TEST)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

# Apply migrations or create tables for the test database
Base.metadata.create_all(bind=engine_test)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope='function', autouse=True)
def clear_users_table():
    # Clear relevant tables before each test run in this module
    # This is a simple way; more robust solutions might involve transaction rollbacks
    # or libraries like pytest-postgresql.
    db = TestingSessionLocal()
    db.query(User).delete()
    # Add other tables to clear if needed, e.g., DriverProfile, GoodsOwnerProfile, Load, Bid, Dispute
    # from .. import models # Import all models if needed here
    # db.query(models.DriverProfile).delete()
    # db.query(models.GoodsOwnerProfile).delete()
    # db.query(models.Load).delete()
    # db.query(models.Bid).delete()
    # db.query(models.Dispute).delete()
    db.commit()
    db.close()
    yield # Test runs here

def test_root_path():
    response = client.get('/')
    assert response.status_code == 200
    assert response.json() == {'message': 'Lorry backend is running and accessible'}

def test_signup_driver():
    response = client.post(
        '/api/auth/signup/driver',
        json={
            'username': 'testdriver',
            'email': 'testdriver@example.com',
            'password': 'testpassword',
            'role': 'driver', # Role needs to be passed for UserCreate
            'profile': {
                'phone_number': '1234567890',
                'vehicle_type': 'Truck',
                'load_capacity_kg': 1000
            }
        }
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data['email'] == 'testdriver@example.com'
    assert 'id' in data
    assert data['role'] == 'driver'

    # Check if user is in DB (optional, direct DB check)
    db = TestingSessionLocal()
    user_in_db = db.query(User).filter(User.email == 'testdriver@example.com').first()
    assert user_in_db is not None
    assert user_in_db.driver_profile is not None
    assert user_in_db.driver_profile.phone_number == '1234567890'
    db.close()


def test_login_and_get_token():
    # First, create a user to login with
    client.post(
        '/api/auth/signup/driver',
        json={
            'username': 'logindriver',
            'email': 'logindriver@example.com',
            'password': 'loginpass',
            'role': 'driver', # Role needs to be passed
            'profile': {'phone_number': '1112223333'}
        }
    )

    response = client.post(
        '/api/auth/login',
        data={'username': 'logindriver@example.com', 'password': 'loginpass'} # Form data
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert 'access_token' in data
    assert data['token_type'] == 'bearer'
    return data['access_token'] # Return token for further tests

def test_access_protected_route_with_token():
    token = test_login_and_get_token() # Get token from a logged-in user

    # Example: Try to access a protected driver route, e.g., GET /api/drivers/loads
    # (This endpoint needs to exist and be protected)
    response = client.get(
        '/api/drivers/loads', # Assuming this is a protected route for drivers
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200, response.text
    # Add more assertions based on the expected response of this endpoint
    # For example, assert isinstance(response.json(), list)

def test_access_protected_route_without_token():
    response = client.get('/api/drivers/loads') # No token
    assert response.status_code == 401 # Expect Unauthorized
    assert response.json()['detail'] == 'Not authenticated' # Or whatever your app returns

def test_access_protected_route_with_invalid_token():
    response = client.get(
        '/api/drivers/loads',
        headers={'Authorization': 'Bearer invalidtokenstring'}
    )
    assert response.status_code == 401
    # The detail message might vary based on JWTError vs user not found in get_current_user
    # For this test, 'Could not validate credentials' is a common one from security.py
    assert response.json()['detail'] == 'Could not validate credentials'


# To run these tests (from the lorry_backend directory):
# 1. Ensure your test database is configured and accessible.
#    You might need to create it manually: CREATE DATABASE your_database_test;
#    Update DATABASE_URL in .env to point to your main DB, not the test one.
#    The test DB URL is constructed as settings.DATABASE_URL + '_test'.
# 2. Install pytest: pip install pytest psycopg2-binary (if not already for backend)
# 3. Run: pytest
#
# Note: For a real test suite, you'd want more comprehensive setup/teardown,
# potentially using a library like pytest-alembic if you use Alembic for migrations,
# or pytest-docker to spin up a test DB instance.
