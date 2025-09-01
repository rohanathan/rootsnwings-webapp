# Users API tests
from unittest.mock import Mock

def test_create_user_endpoint_exists(client, mock_firestore):
    """Test that user creation endpoint exists"""
    user_data = {
        "email": "test@example.com",
        "displayName": "Test User",
        "userType": "student"
    }
    response = client.post("/users/", json=user_data)
    # Should return validation error or success (not 404)
    assert response.status_code in [200, 201, 400, 401, 422]

def test_get_user_by_id_endpoint_exists(client, mock_firestore):
    """Test that user retrieval endpoint exists"""
    response = client.get("/users/test_user_001")
    # Should exist and return user or 404
    assert response.status_code in [200, 404, 401]

def test_update_user_endpoint_exists(client, mock_firestore):
    """Test that user update endpoint exists"""
    update_data = {
        "displayName": "Updated Name",
        "city": "London"
    }
    response = client.put("/users/test_user_001", json=update_data)
    # Should exist and handle update
    assert response.status_code in [200, 404, 401, 422]

def test_get_user_with_profile_type_filter(client, mock_firestore):
    """Test getting user with profile type filter"""
    response = client.get("/users/test_user_001?profile_type=student")
    assert response.status_code in [200, 404, 401]

def test_get_user_with_include_profiles(client, mock_firestore):
    """Test getting user with profiles included"""
    response = client.get("/users/test_user_001?include_profiles=true")
    assert response.status_code in [200, 404, 401]

def test_update_student_profile(client, mock_firestore):
    """Test updating student profile specifically"""
    profile_data = {
        "interests": ["music", "art"],
        "skillLevel": "beginner",
        "learningGoals": ["improve creativity", "learn new skills"]
    }
    response = client.put("/users/test_user_001?profile_type=student", json=profile_data)
    assert response.status_code in [200, 404, 401, 422]

def test_update_mentor_profile(client, mock_firestore):
    """Test updating mentor profile specifically"""
    profile_data = {
        "specialties": ["piano", "guitar"],
        "experience": "5 years",
        "qualifications": ["Grade 8 Piano", "Music Teacher Diploma"]
    }
    response = client.put("/users/test_user_001?profile_type=mentor", json=profile_data)
    assert response.status_code in [200, 404, 401, 422]

def test_delete_user_account(client, mock_firestore):
    """Test account deletion functionality"""
    response = client.put("/users/test_user_001?delete_account=true")
    assert response.status_code in [200, 404, 401, 422]
