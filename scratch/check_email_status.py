import requests

api_token = "re_XL3qdYYB_83TWZV71j2bYGzuJUWzE1izZ"
headers = {
    "Authorization": f"Bearer {api_token}"
}

email_ids = [
    "3d8a55c3-bc01-483a-b4f1-4f5d3b1de934",
    "7ddcf3b5-2ef2-434d-8526-d834d3911146"
]

for email_id in email_ids:
    url = f"https://api.resend.com/emails/{email_id}"
    response = requests.get(url, headers=headers)
    print(f"Status for {email_id}:")
    print("HTTP Status Code:", response.status_code)
    print("Response JSON:", response.text)
    print("-" * 50)
