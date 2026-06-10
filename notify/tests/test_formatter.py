from notify.formatter import format_message

SAMPLE_ARRIVALS = [
    {"status": "전역 도착",          "train_name": "수원행 일반"},
    {"status": "[3]번째 전역 (병점)", "train_name": "천안행 급행"},
    {"status": "[5]번째 전역 (명학)", "train_name": "병점행 일반"},
    {"status": "[7]번째 전역 (오산)", "train_name": "신창행 급행"},
]

def test_header_present():
    msg = format_message(SAMPLE_ARRIVALS, "성균관대", "하행")
    assert "🧚 sixpixie · 퇴근 알림" in msg
    assert "성균관대 하행" in msg

def test_all_arrivals_present():
    msg = format_message(SAMPLE_ARRIVALS, "성균관대", "하행")
    assert "수원행 일반 — 전역 도착" in msg
    assert "천안행 급행 — [3]번째 전역 (병점)" in msg
    assert "병점행 일반 — [5]번째 전역 (명학)" in msg
    assert "신창행 급행 — [7]번째 전역 (오산)" in msg

def test_empty_arrivals_returns_warning():
    msg = format_message([], "성균관대", "하행")
    assert "⚠️" in msg
    assert "열차 정보를 가져올 수 없어요" in msg
