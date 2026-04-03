import argparse
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx


BASE_URL = "https://api.openweathermap.org/data/2.5"


def get_openweather_api_key():
    """Resolve OpenWeather API key from environment or local .env file."""
    key = os.getenv("OPENWEATHER_API_KEY")
    if key:
        return key

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            if name.strip() == "OPENWEATHER_API_KEY":
                parsed = value.strip().strip('"').strip("'")
                if parsed:
                    return parsed

    return ""


def fetch_current_weather(city: str, api_key: str):
    """Fetch current weather data for a city."""
    url = f"{BASE_URL}/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
    }
    response = httpx.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def fetch_forecast(city: str, api_key: str):
    """Fetch 5-day / 3-hour forecast for a city."""
    url = f"{BASE_URL}/forecast"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
    }
    response = httpx.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def pick_afternoon_windows(forecast_items, tz_offset_seconds):
    """Pick forecast entries between 12:00 and 18:00 for local city time (today, else tomorrow)."""
    local_now = datetime.now(timezone.utc) + timedelta(seconds=tz_offset_seconds)
    target_dates = [local_now.date(), (local_now + timedelta(days=1)).date()]

    grouped = {target_dates[0]: [], target_dates[1]: []}

    for item in forecast_items:
        item_local = datetime.fromtimestamp(item["dt"], tz=timezone.utc) + timedelta(seconds=tz_offset_seconds)
        if item_local.date() in grouped and 12 <= item_local.hour <= 18:
            grouped[item_local.date()].append(item)

    return grouped[target_dates[0]] if grouped[target_dates[0]] else grouped[target_dates[1]]


def build_summary(city: str, api_key: str):
    """Build weather + rain risk summary suitable for app integration."""
    current = fetch_current_weather(city, api_key)
    forecast = fetch_forecast(city, api_key)

    tz_offset = current.get("timezone", 0)
    windows = pick_afternoon_windows(forecast.get("list", []), tz_offset)

    pops = [float(item.get("pop", 0.0)) for item in windows]
    max_pop = max(pops) if pops else 0.0
    rain_probability_percent = round(max_pop * 100)

    rain_expected_pm = rain_probability_percent >= 60
    if rain_expected_pm:
        advice = "Rain likely this afternoon. Skip evening watering if soil is still moist."
    elif rain_probability_percent >= 30:
        advice = "Possible light rain this afternoon. Recheck soil before evening watering."
    else:
        advice = "Low afternoon rain chance. Follow normal watering schedule."

    return {
        "city": current.get("name", city),
        "country": (current.get("sys") or {}).get("country", ""),
        "temperature_c": (current.get("main") or {}).get("temp"),
        "humidity_percent": (current.get("main") or {}).get("humidity"),
        "condition": ((current.get("weather") or [{}])[0]).get("description", "unknown"),
        "rain_probability_pm_percent": rain_probability_percent,
        "rain_expected_pm": rain_expected_pm,
        "watering_advice": advice,
    }


def main():
    parser = argparse.ArgumentParser(description="OpenWeather integration helper for plant care advice")
    parser.add_argument("--city", required=True, help="City name, e.g. 'Johor Bahru'")
    parser.add_argument("--api-key", default=None, help="Optional OpenWeather API key override")
    args = parser.parse_args()
    api_key = args.api_key or get_openweather_api_key()

    if not api_key:
        print("Error: OPENWEATHER_API_KEY is missing in environment or .env")
        raise SystemExit(1)

    try:
        summary = build_summary(args.city, api_key)
        print(json.dumps(summary, indent=2))
    except httpx.HTTPStatusError as e:
        print(f"OpenWeather API error: {e.response.status_code} - {e.response.text}")
        raise SystemExit(1)
    except Exception as e:
        print(f"Failed to fetch weather data: {e}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
