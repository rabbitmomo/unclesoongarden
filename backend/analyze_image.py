import argparse
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

from google import genai


MODEL_NAME = "gemini-3-flash-preview"
SYSTEM_PROMPT = (
    "You are a strict plant-image classifier. "
    "You must return ONLY valid JSON, no extra text."
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


def _extract_first_json_object(raw_text: str) -> Optional[Dict[str, Any]]:
    """Extract and parse the first JSON object found in model output."""
    text = (raw_text or "").strip()
    if not text:
        return None

    # Try direct JSON first.
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    # Fallback for markdown/codefence wrappers.
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return None

    try:
        parsed = json.loads(text[start : end + 1])
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        return None

    return None


def analyze_crop_image(
    image_path: str, custom_prompt: Optional[str] = None, model: str = MODEL_NAME, mime_type: str = "image/jpeg"
) -> Optional[Dict[str, Any]]:
    """
    Analyze a crop/plant image using Gemini vision API.
    
    Args:
        image_path: Path to the image file
        custom_prompt: Optional custom analysis prompt
        model: Gemini model to use
        mime_type: MIME type of the image (e.g. 'image/jpeg', 'image/png')
        
    Returns:
        dict: Structured result with keys:
            - has_plant (bool)
            - overall_status ("good"|"warning"|"danger" or null)
            - overall_description (string or null)
            - plant_name (string or null)
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return None

    print(f"Analyzing image: {image_path}")

    try:
        key = get_gemini_api_key()
        client = genai.Client(api_key=key)

        with open(image_path, "rb") as image_file:
            image_data = image_file.read()

        analysis_prompt = custom_prompt or (
            f"{SYSTEM_PROMPT}\n\n"
            "Task:\n"
            "1) Decide whether this image contains a real plant as the main subject.\n"
            "2) If NO plant, return exactly this JSON:\n"
            '{"has_plant": false, "overall_status": null, "overall_description": "No plant detected in image.", "plant_name": null}\n'
            "3) If YES plant, identify ONE most likely plant name (single word when possible, e.g. tomato), "
            "and classify overall_status as exactly one of: good, warning, danger.\n"
            "Also provide a short overall_description with MAX 25 words about current plant condition.\n"
            "4) If YES plant, return exactly this JSON shape:\n"
            '{"has_plant": true, "overall_status": "good|warning|danger", "overall_description": "Plant looks healthy with no visible stress.", "plant_name": "tomato"}\n'
            "Rules: Return ONLY JSON. No markdown. No extra keys."
        )

        response = client.models.generate_content(
            model=model,
            contents=[
                analysis_prompt,
                genai.types.Part(
                    inline_data=genai.types.Blob(
                        mime_type=mime_type,
                        data=image_data,
                    )
                ),
            ],
        )

        print(f"Gemini response text: {response.text}")
        parsed = _extract_first_json_object(response.text or "")
        if not parsed:
            print("Image analysis failed: model did not return valid JSON")
            return None

        has_plant = bool(parsed.get("has_plant", False))
        overall_status = parsed.get("overall_status")
        plant_name = parsed.get("plant_name")
        overall_description = parsed.get("overall_description")

        if not has_plant:
            result = {
                "has_plant": False,
                "overall_status": None,
                "overall_description": "No plant detected in image.",
                "plant_name": None,
            }
            print("Analysis complete. No plant detected.\n")
            return result

        overall_status = (str(overall_status).strip().lower() if overall_status is not None else "")
        if overall_status not in {"good", "warning", "danger"}:
            overall_status = "warning"

        plant_name = str(plant_name).strip().lower() if plant_name is not None else ""
        if not plant_name:
            plant_name = "unknown"

        overall_description = (
            str(overall_description).strip() if overall_description is not None else ""
        )
        if not overall_description:
            if overall_status == "good":
                overall_description = "Plant looks healthy with no obvious issues."
            elif overall_status == "danger":
                overall_description = "Plant shows serious stress and needs immediate attention."
            else:
                overall_description = "Plant condition is moderate and should be monitored closely."

        # Ensure description stays within 25 words.
        words = overall_description.split()
        if len(words) > 25:
            overall_description = " ".join(words[:25])

        # Keep only one plant name token (user requested one name like "tomato").
        plant_name = plant_name.split()[0]

        result = {
            "has_plant": True,
            "overall_status": overall_status,
            "overall_description": overall_description,
            "plant_name": plant_name,
        }
        print("Analysis complete.\n")
        return result
    except Exception as e:
        print(f"Image analysis failed: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="UncleSoon Gemini image analysis for crops")
    parser.add_argument("image_path", help="Path to crop/plant image")
    parser.add_argument(
        "--prompt",
        default=None,
        help="Custom analysis prompt (optional)",
    )
    parser.add_argument(
        "--model",
        default=MODEL_NAME,
        help="Gemini model to use",
    )
    args = parser.parse_args()

    result = analyze_crop_image(args.image_path, args.prompt, args.model)
    if result:
        print("=== ANALYSIS RESULT ===\n")
        print(json.dumps(result, indent=2))
    else:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
