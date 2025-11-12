import json
import re
from datetime import datetime, timezone
from typing import Any, Dict

def normalize_json_result(raw: str) -> str:
    def ensure_timestamp(obj: Dict[str, Any]) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        if isinstance(obj, dict):
            if "generated_at" not in obj or not isinstance(obj["generated_at"], str):
                obj["generated_at"] = now_iso
        return obj
    try:
        parsed = json.loads(raw)
        parsed = ensure_timestamp(parsed)
        return json.dumps(parsed, separators=(",", ":"))
    except Exception:
        pass
    m = re.search(r"```json\s*([\s\S]*?)\s*```", raw)
    if m:
        block = m.group(1).strip()
        try:
            parsed = json.loads(block)
            parsed = ensure_timestamp(parsed)
            return json.dumps(parsed, separators=(",", ":"))
        except Exception:
            pass
    brace_start = raw.find("{")
    brace_end = raw.rfind("}")
    if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
        candidate = raw[brace_start:brace_end + 1]
        try:
            parsed = json.loads(candidate)
            parsed = ensure_timestamp(parsed)
            return json.dumps(parsed, separators=(",", ":"))
        except Exception:
            pass
    return raw

def clean_nan_values(obj: Any) -> Any:
    import math
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_nan_values(i) for i in obj]
    if isinstance(obj, float):
        if math.isnan(obj):
            return None
        return obj
    return obj
