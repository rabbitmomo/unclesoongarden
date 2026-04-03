import cv2
import os
import sys
import httpx
from inference_sdk import InferenceHTTPClient
from pathlib import Path

# Roboflow API configuration
API_URL = "https://serverless.roboflow.com"
MODEL_ID = "tomato-ripeness-jionb/13"


def get_roboflow_api_key():
    """Resolve Roboflow API key from environment or local .env file."""
    key = os.getenv("ROBOFLOW_API_KEY")
    if key:
        return key

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            if name.strip() == "ROBOFLOW_API_KEY":
                parsed = value.strip().strip('"').strip("'")
                if parsed:
                    return parsed

    return ""


API_KEY = get_roboflow_api_key()

# Initialize Roboflow client
CLIENT = InferenceHTTPClient(
    api_url=API_URL,
    api_key=API_KEY
)


def infer_via_detect_api(image_path):
    """Fallback path for keys that are valid but do not have serverless scope."""
    detect_url = f"https://detect.roboflow.com/{MODEL_ID}"
    params = {
        "api_key": API_KEY,
    }

    with open(image_path, "rb") as image_file:
        files = {
            "file": (Path(image_path).name, image_file, "application/octet-stream")
        }
        response = httpx.post(detect_url, params=params, files=files, timeout=60)

    response.raise_for_status()
    return response.json()


def run_inference(image_path):
    """
    Run inference on an image using Roboflow API
    
    Args:
        image_path (str): Path to the input image
        
    Returns:
        dict: Inference results with predictions
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return None
    
    if not API_KEY:
        print("Error: ROBOFLOW_API_KEY is missing in environment or .env")
        return None
    
    print(f"Running inference on: {image_path}")
    
    try:
        # First try serverless SDK path.
        result = CLIENT.infer(image_path, model_id=MODEL_ID)
        print("Inference completed successfully via serverless endpoint")
        return result
    except Exception as e:
        error_text = str(e)
        print(f"Serverless inference failed: {error_text}")

        # Fallback for cases where serverless endpoint rejects request or key scope.
        try:
            print("Trying fallback detect endpoint...")
            result = infer_via_detect_api(image_path)
            print("Inference completed successfully via detect endpoint")
            return result
        except Exception as fallback_error:
            print(f"Fallback inference also failed: {fallback_error}")
            print(f"Error during inference: {e}")
            return None


def save_analyzed_image(image_path, result, output_path=None):
    """
    Save the analyzed image with predictions visualized
    
    Args:
        image_path (str): Path to the original image
        result (dict): Inference results from Roboflow
        output_path (str): Path to save analyzed image (optional)
    """
    if result is None:
        print("No results to process")
        return None
    
    # Read original image
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not read image from {image_path}")
        return None
    
    # Set default output path if not provided
    if output_path is None:
        base_path = Path(image_path)
        output_path = base_path.parent / f"{base_path.stem}_analyzed.jpg"
    
    # Draw predictions on image
    if "predictions" in result:
        for prediction in result["predictions"]:
            # Extract bounding box
            x = int(prediction.get("x", 0))
            y = int(prediction.get("y", 0))
            width = int(prediction.get("width", 0))
            height = int(prediction.get("height", 0))
            confidence = prediction.get("confidence", 0)
            class_name = prediction.get("class", "Unknown")
            
            # Calculate rectangle coordinates
            x1 = x - width // 2
            y1 = y - height // 2
            x2 = x + width // 2
            y2 = y + height // 2
            
            # Draw rectangle
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Add label
            label = f"{class_name}: {confidence:.2f}"
            cv2.putText(image, label, (x1, y1 - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Save analyzed image
    cv2.imwrite(str(output_path), image)
    print(f"Analyzed image saved to: {output_path}")
    return str(output_path)


def main():
    """
    Main function to run inference and save results
    """
    if len(sys.argv) < 2:
        print("Usage: python detect_ripeness.py <image_path> [output_path]")
        print("Example: python detect_ripeness.py image.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Run inference
    result = run_inference(image_path)
    
    if result:
        print("\nInference Results:")
        print(result)
        
        # Save analyzed image
        save_analyzed_image(image_path, result, output_path)
    else:
        print("Inference failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
