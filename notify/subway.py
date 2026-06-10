import requests

LINE_MAP = {
    "1": "1001", "2": "1002", "3": "1003", "4": "1004",
    "5": "1005", "6": "1006", "7": "1007", "8": "1008", "9": "1009",
}

_API_URL = "http://swopenAPI.seoul.go.kr/api/subway/{key}/json/realtimeStationArrival/0/20/{station}"

def get_arrivals(station: str, line: str, direction: str, api_key: str) -> list[dict]:
    try:
        url = _API_URL.format(key=api_key, station=station)
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return []

    line_code = LINE_MAP.get(line, line)
    result = []

    for item in data.get("realtimeArrivalList", []):
        if item.get("subwayId") != line_code:
            continue
        if item.get("updnLine") != direction:
            continue

        result.append({
            "status": item.get("arvlMsg2", "").strip(),
            "train_name": item.get("trainLineNm", "").strip(),
        })

        if len(result) == 4:
            break

    return result
