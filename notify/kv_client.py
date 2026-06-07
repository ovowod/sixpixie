import requests

_BASE = "https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{namespace_id}"

def get_all_user_configs(account_id: str, namespace_id: str, api_token: str) -> list[tuple[str, dict]]:
    headers = {"Authorization": f"Bearer {api_token}"}
    base = _BASE.format(account_id=account_id, namespace_id=namespace_id)

    try:
        keys_resp = requests.get(f"{base}/keys", headers=headers, timeout=10)
        keys_resp.raise_for_status()
        keys = [item["name"] for item in keys_resp.json().get("result", [])]
    except Exception:
        return []

    configs = []
    for key in keys:
        try:
            val_resp = requests.get(f"{base}/values/{key}", headers=headers, timeout=10)
            val_resp.raise_for_status()
            configs.append((key, val_resp.json()))
        except Exception:
            continue

    return configs
