import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import google.genai as genai


DEFAULT_MODEL_NAME = "gemini-2.5-flash"
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]
SYSTEM_PROMPT = (
    "You are a strict plant-image classifier. "
    "You must return ONLY valid JSON, no extra text."
)


def get_model_name() -> str:
    """Resolve Gemini model name from environment or local .env file."""
    model = os.getenv("GEMINI_MODEL")
    if model and model.strip():
        return model.strip()

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            if name.strip() == "GEMINI_MODEL":
                parsed = value.strip().strip('"').strip("'")
                if parsed:
                    return parsed

    return DEFAULT_MODEL_NAME


def build_model_candidates(requested_model: str) -> list[str]:
    """Build an ordered model fallback list, deduplicated while preserving order."""
    ordered = [requested_model, *FALLBACK_MODELS]
    seen: set[str] = set()
    candidates: list[str] = []
    for model in ordered:
        normalized = (model or "").strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        candidates.append(normalized)
    return candidates


def get_gemini_api_key_with_source() -> Tuple[str, str]:
    """Resolve Gemini API key and indicate where it came from."""
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI-API-KEY")
    if key:
        return key, "environment"

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
                    return parsed, "dotenv"

    raise ValueError("GEMINI_API_KEY not found in environment or .env")


def get_gemini_api_key() -> str:
    """Backward-compatible helper returning only the key."""
    key, _ = get_gemini_api_key_with_source()
    return key


def _mask_key_fingerprint(key: str) -> str:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:12]
    suffix = key[-4:] if len(key) >= 4 else "short"
    return f"sha256:{digest}:last4:{suffix}"


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


def _truncate_debug_text(text: Optional[str], limit: int = 1500) -> str:
    value = (text or "").strip()
    if len(value) <= limit:
        return value
    return f"{value[:limit]}... [truncated {len(value) - limit} chars]"


def _should_fallback_model(exc_text: str) -> bool:
    text = (exc_text or "").lower()
    fallback_markers = [
        "not_found",
        "not supported for generatecontent",
        "unavailable",
        "high demand",
        "resource_exhausted",
        "quota",
        "429",
        "503",
    ]
    return any(marker in text for marker in fallback_markers)


def analyze_crop_image(
    image_path: str,
    custom_prompt: Optional[str] = None,
    model: Optional[str] = None,
    mime_type: str = "image/jpeg",
    debug: bool = False,
) -> Tuple[Optional[Dict[str, Any]], Dict[str, Any]]:
    """
    Analyze a crop/plant image using Gemini vision API.
    
    Args:
        image_path: Path to the image file
        custom_prompt: Optional custom analysis prompt
        model: Gemini model to use
        mime_type: MIME type of the image (e.g. 'image/jpeg', 'image/png')
        
    Returns:
        tuple: (result, debug_info)
        dict: Structured result with keys:
            - has_plant (bool)
            - overall_status ("good"|"warning"|"danger" or null)
            - overall_description (string or null)
            - plant_name (string or null)
    """
    requested_model = (model or get_model_name()).strip()
    model_candidates = build_model_candidates(requested_model)

    debug_info: Dict[str, Any] = {
        "image_path": image_path,
        "mime_type": mime_type,
        "model": requested_model,
        "model_candidates": model_candidates,
        "attempted_models": [],
        "status": "started",
    }

    if not os.path.exists(image_path):
        debug_info["status"] = "missing_image"
        debug_info["reason"] = f"Image file not found at {image_path}"
        print(f"[analyze_image] {debug_info['reason']}")
        return None, debug_info

    print(f"[analyze_image] Analyzing image: {image_path} | mime={mime_type} | model={requested_model}")

    try:
        key, key_source = get_gemini_api_key_with_source()
        debug_info["key_source"] = key_source
        debug_info["key_fingerprint"] = _mask_key_fingerprint(key)
        client = genai.Client(api_key=key)

        with open(image_path, "rb") as image_file:
            image_data = image_file.read()

        debug_info["image_bytes"] = len(image_data)
        print(f"[analyze_image] Loaded {len(image_data)} bytes from image")

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

        response = None
        last_model_error: Optional[Exception] = None
        active_model: Optional[str] = None
        for candidate_model in model_candidates:
            active_model = candidate_model
            debug_info["attempted_models"].append(candidate_model)
            try:
                response = client.models.generate_content(
                    model=candidate_model,
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
                debug_info["model"] = candidate_model
                if candidate_model != requested_model:
                    debug_info["model_fallback_used"] = True
                    debug_info["fallback_from"] = requested_model
                    debug_info["fallback_to"] = candidate_model
                break
            except Exception as model_exc:
                last_model_error = model_exc
                exc_text = str(model_exc)
                if _should_fallback_model(exc_text):
                    debug_info["fallback_trigger_reason"] = _truncate_debug_text(exc_text, limit=400)
                    print(
                        f"[analyze_image] Model '{candidate_model}' failed with recoverable error; "
                        "trying next candidate..."
                    )
                    continue
                raise

        if response is None:
            if last_model_error is not None:
                raise last_model_error
            raise RuntimeError("No model candidates available for Gemini request")

        response_text = response.text or ""
        debug_info["raw_response"] = _truncate_debug_text(response_text)
        print(f"[analyze_image] Gemini response text: {debug_info['raw_response']}")
        parsed = _extract_first_json_object(response.text or "")
        if not parsed:
            debug_info["status"] = "invalid_json"
            debug_info["reason"] = "Model did not return valid JSON"
            print("[analyze_image] Image analysis failed: model did not return valid JSON")
            return None, debug_info

        debug_info["parsed_json"] = parsed

        has_plant = bool(parsed.get("has_plant", False))
        overall_status = parsed.get("overall_status")
        plant_name = parsed.get("plant_name")
        overall_description = parsed.get("overall_description")

        debug_info["parsed_has_plant"] = has_plant
        debug_info["parsed_overall_status"] = overall_status
        debug_info["parsed_plant_name"] = plant_name
        debug_info["parsed_overall_description"] = overall_description

        if not has_plant:
            debug_info["status"] = "no_plant"
            debug_info["reason"] = "Gemini classified the image as not containing a plant"
            result = {
                "has_plant": False,
                "overall_status": None,
                "overall_description": "No plant detected in image.",
                "plant_name": None,
            }
            print("[analyze_image] Analysis complete. No plant detected.\n")
            return result, debug_info

        overall_status = (str(overall_status).strip().lower() if overall_status is not None else "")
        if overall_status not in {"good", "warning", "danger"}:
            debug_info["status"] = "normalized_status"
            debug_info["reason"] = f"Invalid overall_status '{overall_status}', normalized to warning"
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
        debug_info["status"] = "success"
        debug_info["reason"] = "Analysis completed successfully"
        debug_info["result"] = result
        print(f"[analyze_image] Analysis complete: {result}\n")
        return result, debug_info
    except Exception as e:
        debug_info["status"] = "exception"
        debug_info["reason"] = str(e)
        if "NOT_FOUND" in str(e):
            debug_info["model_not_found"] = True
        print(f"[analyze_image] Image analysis failed: {e}")
        return None, debug_info


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
        default=get_model_name(),
        help="Gemini model to use",
    )
    args = parser.parse_args()

    result, debug_info = analyze_crop_image(args.image_path, args.prompt, args.model, debug=True)
    if result:
        print("=== ANALYSIS RESULT ===\n")
        print(json.dumps(result, indent=2))
        print("=== DEBUG INFO ===\n")
        print(json.dumps(debug_info, indent=2))
    else:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
