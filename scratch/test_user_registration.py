import requests

base_url = "http://localhost:5000"
register_url = f"{base_url}/api/auth/register"

payload = {
    "Nombre": "TSRReg",
    "Apellido": "VenturaReg",
    "Email": "tsrventura_reg@gmail.com",
    "Password": "Password123!",
    "Telefono": "8095559876",
    "Cedula": "40200000053"
}

print("Attempting to register user...")
try:
    r = requests.post(register_url, json=payload)
    print("Status code:", r.status_code)
    print("Response text:", r.text)
except Exception as e:
    print("Request failed:", e)
