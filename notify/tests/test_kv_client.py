from unittest.mock import patch, MagicMock
from notify.kv_client import get_all_user_configs

def _make_resp(json_data):
    m = MagicMock()
    m.json.return_value = json_data
    m.raise_for_status = MagicMock()
    return m

MOCK_CONFIG = {
    "departure_station": "성균관대",
    "line": "1",
    "direction": "하행",
    "destination_station": "수원",
}

def test_returns_all_user_configs():
    keys_resp = _make_resp({"result": [{"name": "111"}, {"name": "222"}], "success": True})
    val_resp_1 = _make_resp(MOCK_CONFIG)
    val_resp_2 = _make_resp(MOCK_CONFIG)

    with patch("notify.kv_client.requests.get", side_effect=[keys_resp, val_resp_1, val_resp_2]):
        configs = get_all_user_configs("acct", "ns", "token")

    assert len(configs) == 2
    assert configs[0][0] == "111"
    assert configs[0][1]["departure_station"] == "성균관대"

def test_returns_empty_on_network_error():
    with patch("notify.kv_client.requests.get", side_effect=Exception("Network error")):
        configs = get_all_user_configs("acct", "ns", "token")
    assert configs == []

def test_skips_user_with_bad_value():
    keys_resp = _make_resp({"result": [{"name": "111"}, {"name": "222"}], "success": True})
    bad_resp = MagicMock()
    bad_resp.raise_for_status.side_effect = Exception("404")
    good_resp = _make_resp(MOCK_CONFIG)

    with patch("notify.kv_client.requests.get", side_effect=[keys_resp, bad_resp, good_resp]):
        configs = get_all_user_configs("acct", "ns", "token")

    assert len(configs) == 1
    assert configs[0][0] == "222"
