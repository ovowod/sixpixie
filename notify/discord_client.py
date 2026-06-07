import requests

_API = "https://discord.com/api/v10"

def send_dm(user_id: str, message: str, bot_token: str) -> None:
    headers = {
        "Authorization": f"Bot {bot_token}",
        "Content-Type": "application/json",
    }

    channel_resp = requests.post(
        f"{_API}/users/@me/channels",
        headers=headers,
        json={"recipient_id": user_id},
        timeout=10,
    )
    channel_resp.raise_for_status()
    channel_id = channel_resp.json()["id"]

    msg_resp = requests.post(
        f"{_API}/channels/{channel_id}/messages",
        headers=headers,
        json={"content": message},
        timeout=10,
    )
    msg_resp.raise_for_status()
