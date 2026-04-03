import argparse
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


def ask_uncle_soon(user_prompt: str, model: str = MODEL_NAME) -> str:
    """Send a prompt to Gemini and return UncleSoon's response text."""
    key = get_gemini_api_key()
    client = genai.Client(api_key=key)

    combined_prompt = f"{SYSTEM_PROMPT}\n\nUser question: {user_prompt}"

    response = client.models.generate_content(
        model=model,
        contents=combined_prompt,
    )

    return (response.text or "").strip()


def main() -> None:
    parser = argparse.ArgumentParser(description="UncleSoon Gemini farming assistant")
    parser.add_argument(
        "--prompt",
        default="Explain how AI works in a few words",
        help="Question for UncleSoon",
    )
    parser.add_argument(
        "--model",
        default=MODEL_NAME,
        help="Gemini model name",
    )
    args = parser.parse_args()

    try:
        answer = ask_uncle_soon(args.prompt, args.model)
        print(answer)
    except Exception as e:
        print(f"Gemini request failed: {e}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
