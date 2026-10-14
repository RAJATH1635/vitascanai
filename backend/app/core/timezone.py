from datetime import datetime, timezone, timedelta
from typing import Optional

# IST is UTC+05:30
IST = timezone(timedelta(hours=5, minutes=30), name="Asia/Kolkata")


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


def as_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensure datetime has tzinfo=timezone.utc. If naive, assume UTC."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def as_ist(dt: Optional[datetime]) -> Optional[datetime]:
    """Convert datetime to Asia/Kolkata (IST). If naive, assume it was recorded in UTC."""
    if dt is None:
        return None
    dt_utc = as_utc(dt)
    return dt_utc.astimezone(IST)


def format_iso_utc(dt: Optional[datetime]) -> Optional[str]:
    """Serialize datetime to unambiguous ISO 8601 UTC string ending in 'Z'."""
    if dt is None:
        return None
    dt_utc = as_utc(dt)
    iso = dt_utc.isoformat()
    if iso.endswith("+00:00"):
        return iso[:-6] + "Z"
    return iso
