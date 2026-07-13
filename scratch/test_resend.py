import os
import requests

api_token = "re_XL3qdYYB_83TWZV71j2bYGzuJUWzE1izZ"
url = "https://api.resend.com/emails"

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

payload = {
    "from": "VeriFinca <hola@handymansolutionrd.lat>",
    "to": ["see_black@hotmail.com"],
    "subject": "Test from Script to see_black",
    "html": "<strong>It works!</strong>"
}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Response JSON:", response.text)
