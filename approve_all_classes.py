#!/usr/bin/env python3
"""
Script to approve all classes in the database
"""
import requests
import json

# API base URL
BASE_URL = "https://rootsnwings-api-944856745086.europe-west2.run.app"

def get_all_class_ids():
    """Get all class IDs by trying to fetch with a very large page size"""
    try:
        # Try to get all classes with a large page size (without status filtering in endpoint)
        response = requests.get(f"{BASE_URL}/classes/?pageSize=100")
        response.raise_for_status()
        
        data = response.json()
        class_ids = [cls["classId"] for cls in data.get("classes", [])]
        
        print(f"Found {len(class_ids)} classes currently visible")
        print("Current class IDs:", class_ids)
        return class_ids
    except Exception as e:
        print(f"Error getting classes: {e}")
        return []

def approve_class(class_id):
    """Approve a single class"""
    try:
        response = requests.post(
            f"{BASE_URL}/classes/{class_id}/approve",
            json={"admin_notes": "Batch approval to fix classes endpoint filtering"},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        
        result = response.json()
        print(f"APPROVED {class_id}: {result['message']}")
        return True
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print(f"ERROR: Class {class_id} not found")
        elif e.response.status_code == 500:
            # Might already be approved
            print(f"WARNING: Class {class_id} might already be approved or has an issue")
        else:
            print(f"ERROR approving {class_id}: {e.response.text}")
        return False
    except Exception as e:
        print(f"ERROR approving {class_id}: {e}")
        return False

def main():
    print("Getting all currently visible classes...")
    class_ids = get_all_class_ids()
    
    if not class_ids:
        print("No classes found to approve")
        return
    
    print(f"\nApproving {len(class_ids)} classes...")
    
    approved_count = 0
    for class_id in class_ids:
        if approve_class(class_id):
            approved_count += 1
    
    print(f"\nSuccessfully approved {approved_count}/{len(class_ids)} classes")
    
    # Check if more classes are now visible
    print(f"\nChecking classes endpoint again...")
    response = requests.get(f"{BASE_URL}/classes/")
    if response.status_code == 200:
        data = response.json()
        total_now = data.get("total", 0)
        print(f"Classes now visible: {total_now}")
    else:
        print("Could not check classes endpoint")

if __name__ == "__main__":
    main()