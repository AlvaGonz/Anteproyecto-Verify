import requests

resp = requests.post("http://localhost:5000/api/auth/login", json={"email":"admin@verifinca.do","password":"AdminVerifinca2026!"})
token = resp.json().get("accessToken")

r2 = requests.get("http://localhost:5000/api/admin/dashboard/stats", headers={"Authorization": f"Bearer {token}"})
print("Dashboard Stats:", r2.status_code)
if r2.status_code == 200:
    print(r2.json())
else:
    print(r2.text)
