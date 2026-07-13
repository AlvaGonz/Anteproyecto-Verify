import requests

base_url = "http://localhost:5000"

# Step 1: Login as Corporativo
login_url = f"{base_url}/api/auth/login"
login_payload = {
    "Email": "corporativo@verifinca.do",
    "Password": "CorporativoVerifinca2026!"
}

print("Attempting login as Corporativo...")
login_response = requests.post(login_url, json=login_payload)

if login_response.status_code != 200:
    print(f"Login failed: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json().get("token")
print("Login successful. Token obtained.")

# Step 2: Create a user to test resend integration
create_url = f"{base_url}/api/admin/users/invite"
create_payload = {
    "Nombre": "TSRTestFive",
    "Apellido": "VenturaTestFive",
    "Email": "see_black@hotmail.com",
    "Telefono": "(829) 422-9172",
    "Cedula": "402-2518438-7"
}

headers = {
    "Authorization": f"Bearer {token}"
}

print("Attempting to invite user...")
create_response = requests.post(create_url, json=create_payload, headers=headers)

print(f"Create User Response Code: {create_response.status_code}")
print(f"Create User Response Body: {create_response.text}")
