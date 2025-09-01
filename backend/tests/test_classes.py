# Tests for classes API
from unittest.mock import Mock

def test_get_classes_basic(client, mock_firestore, class_data):
    """Test we can get a list of classes"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data
    assert len(data["classes"]) > 0

def test_get_classes_by_type_workshop(client, mock_firestore, workshop_class_data):
    """Test filtering classes by type=workshop"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = workshop_class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?type=workshop")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_by_type_group(client, mock_firestore, group_class_data):
    """Test filtering classes by type=group"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = group_class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?type=group")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_by_type_onetoone(client, mock_firestore, onetoone_class_data):
    """Test filtering classes by type=onetoone"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = onetoone_class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?type=onetoone")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_with_mentor_filter(client, mock_firestore, class_data):
    """Test filtering classes by mentorId"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?mentorId=test_mentor_001")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_with_status_filter(client, mock_firestore, class_data):
    """Test filtering classes by status"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?status=approved")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_with_multiple_filters(client, mock_firestore, workshop_class_data):
    """Test filtering classes with multiple parameters"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = workshop_class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?type=workshop&status=approved&mentorId=test_mentor_001")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_single_class_success(client, mock_firestore, class_data):
    """Test getting one class by ID using query parameter"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes?classId=test_class_001")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_class_not_found(client, mock_firestore):
    """Test 404 when class doesn't exist"""
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore.collection.return_value.document.return_value.get.return_value = mock_doc
    
    response = client.get("/classes/nonexistent")
    assert response.status_code == 404

def test_get_classes_pagination(client, mock_firestore, class_data):
    """Test classes pagination parameters"""
    mock_doc = Mock()
    mock_doc.to_dict.return_value = class_data
    mock_firestore.collection.return_value.stream.return_value = [mock_doc]
    
    response = client.get("/classes/?pageSize=10&page=1")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data

def test_get_classes_invalid_type(client, mock_firestore):
    """Test invalid class type filter"""
    response = client.get("/classes/?type=invalid_type")
    assert response.status_code in [200, 400]  # Should handle gracefully


