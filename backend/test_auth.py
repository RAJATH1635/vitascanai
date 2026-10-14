import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_auth():
    print("Testing Registration...")
    reg_data = {
        "email": "test@vitascan.ai",
        "password": "Password123!",
        "full_name": "Test User",
        "role": "PATIENT"
    }
    r = requests.post(f"{BASE_URL}/register", json=reg_data)
    if r.status_code == 200:
        print("Registration OK")
    elif r.status_code == 400 and "Email already registered" in r.text:
        print("Registration OK (Already exists)")
    else:
        print("Registration Failed:", r.text)

    print("Testing Login...")
    login_data = {
        "username": "test@vitascan.ai",
        "password": "Password123!"
    }
    r = requests.post(f"{BASE_URL}/login", data=login_data)
    if r.status_code == 200:
        print("Login OK")
        token = r.json()["access_token"]
        refresh = r.json()["refresh_token"]
        
        print("Testing Get Me...")
        r_me = requests.get(f"{BASE_URL}/me", headers={"Authorization": f"Bearer {token}"})
        if r_me.status_code == 200:
            print("Get Me OK")
        else:
            print("Get Me Failed:", r_me.text)
            
        print("Testing Refresh Token...")
        r_ref = requests.post(f"{BASE_URL}/refresh?refresh_token={refresh}")
        if r_ref.status_code == 200:
            print("Refresh Token OK")
        else:
            print("Refresh Token Failed:", r_ref.text)
            
    else:
        print("Login Failed:", r.text)

if __name__ == "__main__":
    test_auth()
