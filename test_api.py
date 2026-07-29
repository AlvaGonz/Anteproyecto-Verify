import requests
import time
import json

base_url = "http://localhost:5000/api"

email = f"test_{int(time.time())}@example.com"
password = "Password123!"

print(f"Registering {email}...")
r1 = requests.post(f"{base_url}/auth/register", json={
    "nombre": "Test",
    "apellidos": "User",
    "email": email,
    "password": password,
    "confirmPassword": password
})
print("Register response:", r1.status_code, r1.text)

r2 = requests.get(f"{base_url}/dev/last-verification-token?email={email}")
print("Dev token response:", r2.status_code, r2.text)
token = r2.json()["token"]

print(f"Verifying first time with token {token}...")
r3 = requests.get(f"{base_url}/auth/verify?token={token}")
print("Verify 1 response:", r3.status_code, r3.text)

print(f"Verifying second time with token {token}...")
r4 = requests.get(f"{base_url}/auth/verify?token={token}")
print("Verify 2 response:", r4.status_code, r4.text)
