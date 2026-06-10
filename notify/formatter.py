def format_message(arrivals: list[dict], station: str, direction: str) -> str:
    if not arrivals:
        return "⚠️ 열차 정보를 가져올 수 없어요."

    lines = [
        "🧚 sixpixie · 퇴근 알림",
        "",
        f"{station} {direction}",
    ]
    for a in arrivals:
        lines.append(f"• {a['train_name']} — {a['status']}")
    return "\n".join(lines)
