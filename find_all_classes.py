#!/usr/bin/env python3
"""
Script to find ALL classes in the database, regardless of status
"""
import requests
import json

# API base URL
BASE_URL = "https://rootsnwings-api-944856745086.europe-west2.run.app"

def test_different_endpoints():
    """Test different endpoint combinations to find hidden classes"""
    
    endpoints_to_try = [
        "/classes/",
        "/classes/?pageSize=100",
        "/classes/?page=1&pageSize=100", 
        "/classes/?type=batch",
        "/classes/?type=workshop",
        "/classes/?type=group",
        "/classes/?type=one-on-one",
    ]
    
    all_found_classes = set()
    
    for endpoint in endpoints_to_try:
        try:
            print(f"\nTesting: {BASE_URL}{endpoint}")
            response = requests.get(f"{BASE_URL}{endpoint}")
            response.raise_for_status()
            
            data = response.json()
            classes = data.get("classes", [])
            total = data.get("total", 0)
            
            print(f"  Found {len(classes)} classes (total: {total})")
            
            for cls in classes:
                class_id = cls.get("classId")
                class_type = cls.get("type", "unknown")
                title = cls.get("title", "Unknown")[:50]
                all_found_classes.add(class_id)
                print(f"    - {class_id} ({class_type}): {title}")
                
        except Exception as e:
            print(f"  Error: {e}")
    
    print(f"\n=== SUMMARY ===")
    print(f"Unique classes found across all endpoints: {len(all_found_classes)}")
    print("All class IDs:", sorted(list(all_found_classes)))
    
    return list(all_found_classes)

def approve_all_found_classes(class_ids):
    """Approve all classes found"""
    print(f"\nApproving {len(class_ids)} classes...")
    
    approved_count = 0
    for class_id in class_ids:
        try:
            response = requests.post(
                f"{BASE_URL}/classes/{class_id}/approve",
                json={"admin_notes": "Comprehensive approval to expose all classes"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"  APPROVED: {class_id}")
                approved_count += 1
            else:
                print(f"  SKIPPED: {class_id} ({response.status_code})")
                
        except Exception as e:
            print(f"  ERROR: {class_id} - {e}")
    
    print(f"\nApproved {approved_count}/{len(class_ids)} classes")

def main():
    print("=== COMPREHENSIVE CLASS SEARCH ===")
    
    # Test different endpoint combinations
    all_class_ids = test_different_endpoints()
    
    if all_class_ids:
        approve_all_found_classes(all_class_ids)
        
        # Final test
        print(f"\n=== FINAL CHECK ===")
        response = requests.get(f"{BASE_URL}/classes/?pageSize=50")
        if response.status_code == 200:
            data = response.json()
            total = data.get("total", 0)
            print(f"Classes now visible: {total}")
        else:
            print("Could not perform final check")
    else:
        print("No classes found!")

if __name__ == "__main__":
    main()