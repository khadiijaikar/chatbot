import requests

# Define the REST endpoint URL
rest_endpoint = "http://localhost:5005/webhooks/rest/webhook"

# Construct the message payload
payload = {
    "sender": "test_user",
    "message": "Hi there!"
}

# Send the message to the REST endpoint
response = requests.post(rest_endpoint, json=payload)

# Handle the response
if response.status_code == 200:
    bot_responses = response.json()
    for bot_response in bot_responses:
        if "text" in bot_response:
            print("Bot:", bot_response["text"])
        elif "image" in bot_response:
            print("Bot sent an image:", bot_response["image"])
else:
    print("Failed to send message:", response.status_code)
