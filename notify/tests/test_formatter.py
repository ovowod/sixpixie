from notify.formatter import format_message

SAMPLE_ARRIVALS = [
    {"arrival_time": "18:15", "minutes_away": 2,  "train_name": "수원행 일반"},
    {"arrival_time": "18:20", "minutes_away": 7,  "train_name": "천안행 급행"},
    {"arrival_time": "18:28", "minutes_away": 15, "train_name": "병점행 일반"},
    {"arrival_time": "18:35", "minutes_away": 22, "train_name": "신창행 급행"},
]

def test_header_present():
    msg = format_message(SAMPLE_ARRIVALS, "성균관대", "하행")
    assert "🧚 sixpixie · 퇴근 알림" in msg
    assert "성균관대 하행" in msg

def test_all_arrivals_present():
    msg = format_message(SAMPLE_ARRIVALS, "성균관대", "하행")
    assert "18:15 도착 (2분 후) — 수원행 일반" in msg
    assert "18:20 도착 (7분 후) — 천안행 급행" in msg
    assert "18:28 도착 (15분 후) — 병점행 일반" in msg
    assert "18:35 도착 (22분 후) — 신창행 급행" in msg

def test_empty_arrivals_returns_warning():
    msg = format_message([], "성균관대", "하행")
    assert "⚠️" in msg
    assert "열차 정보를 가져올 수 없어요" in msg
