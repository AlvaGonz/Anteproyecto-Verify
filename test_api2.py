import requests
import json
import base64

resp = requests.post("http://localhost:5000/api/auth/login", json={"email":"admin@verifinca.do","password":"AdminVerifinca2026!"})
token = resp.json().get("token")
parts = token.split(".")
if len(parts) > 1:
    payload = parts[1]
    payload += "=" * ((4 - len(payload) % 4) % 4)
    print(json.loads(base64.b64decode(payload)))
