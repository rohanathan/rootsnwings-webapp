# Mentor API tests
from unittest.mock import Mock

def test_get_mentors_basic(client, mock_firestore, mentor_data):
    """Test getting list of mentors"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data
    assert len(data["mentors"]) > 0

def test_get_mentors_with_category_filter(client, mock_firestore, music_mentor_data):
    """Test filtering mentors by category"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = music_mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?category=music")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

def test_get_mentors_with_region_filter(client, mock_firestore, london_mentor_data):
    """Test filtering mentors by region"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = london_mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?region=London")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

def test_get_mentors_with_subject_filter(client, mock_firestore, mentor_data):
    """Test filtering mentors by subject"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?subject=piano")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

def test_get_mentors_with_multiple_filters(client, mock_firestore, music_mentor_data):
    """Test filtering mentors with multiple parameters"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = music_mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?category=music&region=London&verified=true")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

def test_get_mentors_pagination(client, mock_firestore, mentor_data):
    """Test mentors pagination"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?pageSize=5&page=1")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

def test_get_mentor_by_id_success(client, mock_firestore, mentor_data):
    """Test getting individual mentor successfully"""
    mock_doc = Mock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.document.return_value.get.return_value = mock_doc
    
    response = client.get("/mentors/test_mentor_001")
    assert response.status_code == 200
    data = response.json()
    assert "uid" in data

def test_get_mentor_by_id_not_found(client, mock_firestore):
    """Test 404 when mentor doesn't exist"""
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore.collection.return_value.document.return_value.get.return_value = mock_doc
    
    response = client.get("/mentors/nonexistent_mentor")
    assert response.status_code == 404

def test_get_mentors_by_specialties(client, mock_firestore, mentor_data):
    """Test filtering mentors by specialties"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    specialties = ["beginner-friendly", "advanced", "cultural-immersion", "traditional"]
    for specialty in specialties:
        response = client.get(f"/mentors/?specialty={specialty}")
        assert response.status_code == 200

def test_get_mentors_by_rating(client, mock_firestore, mentor_data):
    """Test filtering mentors by minimum rating"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?minRating=4.5")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

def test_get_mentors_with_availability(client, mock_firestore, mentor_data):
    """Test filtering mentors by availability"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = mentor_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/mentors/?hasAvailability=true")
    assert response.status_code == 200
    data = response.json()
    assert "mentors" in data

