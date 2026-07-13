import requests

base_url = "http://localhost:5000"

# Step 1: Login
login_url = f"{base_url}/api/auth/login"
login_payload = {
    "Email": "admin@verifinca.do",
    "Password": "AdminVerifinca2026!"
}

print("Attempting login...")
try:
    r_login = requests.post(login_url, json=login_payload)
    print("Login status:", r_login.status_code)
    login_data = r_login.json()
    token = login_data.get("accessToken")
    if not token:
        print("No token received. Response:", login_data)
        exit(1)
except Exception as e:
    print("Login request failed:", e)
    exit(1)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Step 2: Create User
create_url = f"{base_url}/api/admin/users"
create_payload = {
    "Nombre": "TSRTestTwo",
    "Apellido": "VenturaTestTwo",
    "Email": "see_black@hotmail.com",
    "Role": "user",
    "Telefono": "8095554321",
    "Cedula": "40200000056",
    "Password": "Password123!"
}

print("\nAttempting to create user...")
try:
    r_create = requests.post(create_url, json=create_payload, headers=headers)
    print("Create status:", r_create.status_code)
    print("Create response:", r_create.text)
except Exception as e:
    print("Create request failed:", e)
