import argparse
import json
import os
from pathlib import Path

from google import genai


MODEL_NAME = "gemini-3-flash-preview"
SYSTEM_PROMPT = (
    "You are UncleSoon, an AI Farming assistant. "
    "Give practical, concise farming advice that is friendly and easy to follow."
)


def get_gemini_api_key() -> str:
    """Resolve Gemini API key from environment or local .env file."""
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI-API-KEY")
    if key:
        return key

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            if name.strip() in {"GEMINI_API_KEY", "GEMINI-API-KEY"}:
                parsed = value.strip().strip('"').strip("'")
                if parsed:
                    return parsed

    raise ValueError("GEMINI_API_KEY not found in environment or .env")


def generate_growth_report(growth_data: dict) -> str:
    """Use Gemini to analyze growth data and generate care guide."""
    try:
        key = get_gemini_api_key()
        client = genai.Client(api_key=key)

        growth_info = f"""
Plant Growth Analysis:
- Previous Size: {growth_data['previous']['size']} cm³ (height: {growth_data['previous']['height_cm']}cm, width: {growth_data['previous']['width_cm']}cm, length: {growth_data['previous']['length_cm']}cm)
- Latest Size: {growth_data['latest']['size']} cm³ (height: {growth_data['latest']['height_cm']}cm, width: {growth_data['latest']['width_cm']}cm, length: {growth_data['latest']['length_cm']}cm)
- Absolute Growth: {growth_data['growth']['absolute_size']} cm³
- Growth Percentage: {growth_data['growth']['percent']}%
- Status: {growth_data['growth']['status']}

Please provide:
1. Assessment of the plant's growth rate
2. Specific care recommendations to maintain or improve growth
3. Any warning signs to watch for based on the growth pattern
4. Next steps for optimal plant health
"""

        combined_prompt = f"{SYSTEM_PROMPT}\n\n{growth_info}"

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=combined_prompt,
        )

        return (response.text or "").strip()
    except Exception as e:
        return f"AI analysis unavailable: {e}"


def calculate_size(height_cm: float, width_cm: float, length_cm: float) -> float:
    """Calculate size using height * width * length."""
    return height_cm * width_cm * length_cm


def calculate_growth(
    previous_height: float,
    previous_width: float,
    previous_length: float,
    latest_height: float,
    latest_width: float,
    latest_length: float,
):
    """Compute previous/latest size and growth percentage."""
    previous_size = calculate_size(previous_height, previous_width, previous_length)
    latest_size = calculate_size(latest_height, latest_width, latest_length)
    absolute_growth = latest_size - previous_size

    growth_percent = 0.0
    if previous_size > 0:
        growth_percent = (absolute_growth / previous_size) * 100.0

    return {
        "previous": {
            "height_cm": previous_height,
            "width_cm": previous_width,
            "length_cm": previous_length,
            "size": round(previous_size, 2),
        },
        "latest": {
            "height_cm": latest_height,
            "width_cm": latest_width,
            "length_cm": latest_length,
            "size": round(latest_size, 2),
        },
        "growth": {
            "absolute_size": round(absolute_growth, 2),
            "percent": round(growth_percent, 2),
            "status": "increased" if absolute_growth > 0 else "decreased" if absolute_growth < 0 else "no_change",
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Track plant growth by comparing size from height, width, and length")

    # Default values requested by user
    parser.add_argument("--previous-height", type=float, default=23.0, help="Previous height in cm")
    parser.add_argument("--previous-width", type=float, default=3.0, help="Previous width in cm")
    parser.add_argument("--previous-length", type=float, default=1.0, help="Previous length in cm")
    parser.add_argument("--latest-height", type=float, default=27.0, help="Latest height in cm")
    parser.add_argument("--latest-width", type=float, default=3.0, help="Latest width in cm")
    parser.add_argument("--latest-length", type=float, default=1.0, help="Latest length in cm")

    args = parser.parse_args()

    result = calculate_growth(
        previous_height=args.previous_height,
        previous_width=args.previous_width,
        previous_length=args.previous_length,
        latest_height=args.latest_height,
        latest_width=args.latest_width,
        latest_length=args.latest_length,
    )

    print("=== GROWTH METRICS ===")
    print(json.dumps(result, indent=2))
    
    print("\n=== AI CARE GUIDE & ANALYSIS ===")
    report = generate_growth_report(result)
    print(report)


if __name__ == "__main__":
    main()
