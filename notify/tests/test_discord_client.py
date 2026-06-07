import pytest
from unittest.mock import patch, MagicMock
from notify.discord_client import send_dm

def _make_resp(json_data=None):
    m = MagicMock()
    m.json.return_value = json_data or {}
    m.raise_for_status = MagicMock()
    return m

def test_creates_dm_channel_then_sends_message():
    channel_resp = _make_resp({"id": "dm_channel_999"})
    message_resp = _make_resp()

    with patch("notify.discord_client.requests.post", side_effect=[channel_resp, message_resp]) as mock_post:
        send_dm(user_id="123456789", message="hello", bot_token="bot_tok")

    assert mock_post.call_count == 2
    assert mock_post.call_args_list[0][1]["json"]["recipient_id"] == "123456789"
    assert "dm_channel_999" in mock_post.call_args_list[1][0][0]
    assert mock_post.call_args_list[1][1]["json"]["content"] == "hello"

def test_raises_when_channel_creation_fails():
    bad_resp = MagicMock()
    bad_resp.raise_for_status.side_effect = Exception("403 Forbidden")

    with patch("notify.discord_client.requests.post", return_value=bad_resp):
        with pytest.raises(Exception, match="403"):
            send_dm("123", "msg", "bad_token")
