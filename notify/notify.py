# notify/notify.py
import os
import sys
from datetime import date

from holiday import is_korean_holiday
from subway import get_arrivals
from formatter import format_message
from discord_client import send_dm
from kv_client import get_all_user_configs


def main():
    skip_holiday = os.getenv("SKIP_HOLIDAY_CHECK", "false").lower() == "true"
    today = date.today()

    if not skip_holiday and is_korean_holiday(today):
        print(f"Today {today} is a Korean public holiday. Skipping.")
        sys.exit(0)

    account_id = os.environ["CF_ACCOUNT_ID"]
    namespace_id = os.environ["CF_KV_NAMESPACE_ID"]
    cf_token = os.environ["CF_API_TOKEN"]
    bot_token = os.environ["DISCORD_BOT_TOKEN"]
    subway_api_key = os.environ["SUBWAY_API_KEY"]

    user_configs = get_all_user_configs(account_id, namespace_id, cf_token)
    if not user_configs:
        print("No user configs found. Exiting.")
        sys.exit(0)

    for user_id, config in user_configs:
        arrivals = get_arrivals(
            station=config["departure_station"],
            line=config["line"],
            direction=config["direction"],
            api_key=subway_api_key,
        )
        message = format_message(
            arrivals=arrivals,
            station=config["departure_station"],
            direction=config["direction"],
        )
        try:
            send_dm(user_id=user_id, message=message, bot_token=bot_token)
            print(f"Sent notification to user {user_id}")
        except Exception as e:
            print(f"Failed to send DM to {user_id}: {e}")


if __name__ == "__main__":
    main()
