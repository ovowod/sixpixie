from datetime import date
from notify.holiday import is_korean_holiday

def test_chuseok_is_holiday():
    # 2026 추석: September 25
    assert is_korean_holiday(date(2026, 9, 25)) is True

def test_weekday_is_not_holiday():
    assert is_korean_holiday(date(2026, 6, 9)) is False

def test_new_years_day_is_holiday():
    assert is_korean_holiday(date(2026, 1, 1)) is True

def test_seollal_is_holiday():
    # 2026 설날: February 17
    assert is_korean_holiday(date(2026, 2, 17)) is True
