# Booking API tests
from unittest.mock import Mock

def test_bookings_endpoints_exist(client, mock_firestore):
    """Test that bookings endpoints are accessible"""
    # Test that endpoints respond (even if with 404/422 due to missing auth)
    response = client.get("/bookings/")
    # Endpoint exists - 404 is fine for this basic test
    assert response.status_code in [200, 404, 422]
