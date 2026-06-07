from datetime import date
import holidays

def is_korean_holiday(d: date) -> bool:
    kr = holidays.KR(years=d.year)
    return d in kr
