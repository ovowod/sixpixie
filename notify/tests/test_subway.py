from unittest.mock import patch, MagicMock
from notify.subway import get_arrivals, LINE_MAP

MOCK_RESPONSE = {
    "errorMessage": {"status": 200, "code": "INFO-000"},
    "realtimeArrivalList": [
        {"subwayId": "1001", "updnLine": "하행", "trainLineNm": "천안행 급행", "barvlDt": "0", "recptnDt": "2026-06-07 17:52:00", "arvlMsg2": "전역 도착"},
        {"subwayId": "1001", "updnLine": "상행", "trainLineNm": "소요산행 일반", "barvlDt": "0", "recptnDt": "2026-06-07 17:52:00", "arvlMsg2": "전역 출발"},
        {"subwayId": "1001", "updnLine": "하행", "trainLineNm": "수원행 일반", "barvlDt": "0", "recptnDt": "2026-06-07 17:52:00", "arvlMsg2": "[3]번째 전역 (병점)"},
        {"subwayId": "1002", "updnLine": "하행", "trainLineNm": "성수행", "barvlDt": "0", "recptnDt": "2026-06-07 17:52:00", "arvlMsg2": "전역 도착"},
    ],
}

def _mock_get(response):
    mock = MagicMock()
    mock.json.return_value = response
    mock.raise_for_status = MagicMock()
    return mock

def test_line_map_has_correct_codes():
    assert LINE_MAP["1"] == "1001"
    assert LINE_MAP["2"] == "1002"

def test_filters_by_line_and_direction():
    with patch("notify.subway.requests.get", return_value=_mock_get(MOCK_RESPONSE)):
        arrivals = get_arrivals("성균관대", "1", "하행", "test_key")
    assert len(arrivals) == 2
    assert arrivals[0]["train_name"] == "천안행 급행"
    assert arrivals[1]["train_name"] == "수원행 일반"

def test_returns_status_from_arvlMsg2():
    with patch("notify.subway.requests.get", return_value=_mock_get(MOCK_RESPONSE)):
        arrivals = get_arrivals("성균관대", "1", "하행", "test_key")
    assert arrivals[0]["status"] == "전역 도착"
    assert arrivals[1]["status"] == "[3]번째 전역 (병점)"

def test_returns_max_4_arrivals():
    many = {
        "errorMessage": {"status": 200, "code": "INFO-000"},
        "realtimeArrivalList": [
            {"subwayId": "1001", "updnLine": "하행", "trainLineNm": f"열차{i}", "barvlDt": "0", "recptnDt": "2026-06-07 17:52:00", "arvlMsg2": f"[{i}]번째 전역"}
            for i in range(1, 8)
        ],
    }
    with patch("notify.subway.requests.get", return_value=_mock_get(many)):
        arrivals = get_arrivals("성균관대", "1", "하행", "test_key")
    assert len(arrivals) == 4

def test_returns_empty_list_on_request_error():
    with patch("notify.subway.requests.get", side_effect=Exception("Connection error")):
        arrivals = get_arrivals("성균관대", "1", "하행", "test_key")
    assert arrivals == []
