# Tests for classes API
from unittest.mock import Mock

def test_get_classes(client, mock_firestore, class_data):
    """Test we can get a list of classes"""
    # Mock some classes data
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_by_type(client, mock_firestore, class_data):
    """Test filtering classes by type"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?type=workshop")
    assert response.status_code == 200

def test_get_single_class(client, mock_firestore, class_data):
    """Test getting one class by ID"""
    # For now, just test that the endpoint exists and handles 404s
    response = client.get("/classes/nonexistent")
    assert response.status_code == 404

def test_get_class_not_found(client, mock_firestore):
    """Test 404 when class doesn't exist"""
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore.collection.return_value.document.return_value = mock_doc
    
    response = client.get("/classes/nonexistent")
    assert response.status_code == 404