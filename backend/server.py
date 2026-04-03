import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from supabase import Client, create_client

try:
    from backend.analyze_image import analyze_crop_image
except ModuleNotFoundError:
    from analyze_image import analyze_crop_image

app = FastAPI(
    title="Uncle Soon Garden API",
    description="Light agriculture AI inference server",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_env_value(name: str) -> str:
    value = os.getenv(name)
    if value:
        return value

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            if key.strip() == name:
                return val.strip().strip('"').strip("'")

    return ""


DB_SUPABASE_SECRET_URL = get_env_value("DB_SUPABASE_SECRET_URL")
DB_SUPABASE_SECRET_KEY = get_env_value("DB_SUPABASE_SECRET_KEY")
TABLE_NAME = "test_data"


def get_supabase_client() -> Client:
    if not DB_SUPABASE_SECRET_URL or not DB_SUPABASE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Missing DB_SUPABASE_SECRET_URL or DB_SUPABASE_SECRET_KEY in .env")
    return create_client(DB_SUPABASE_SECRET_URL, DB_SUPABASE_SECRET_KEY)


class TestDataIn(BaseModel):
    name: str
    note: str


class AnalyzeImageResponse(BaseModel):
    has_plant: bool
    overall_status: str | None
    overall_description: str | None
    plant_name: str | None


@app.get("/")
def read_root():
    """Root endpoint."""
    return JSONResponse(
        {
            "status": "online",
            "message": "Uncle Soon Garden API is running",
            "version": "0.1.0"
        }
    )


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return JSONResponse(
        {
            "status": "healthy",
            "message": "Server is up and running"
        }
    )


@app.post("/api/test-data")
def create_test_data(payload: TestDataIn):
    """Insert simple testing data into Supabase."""
    try:
        supabase = get_supabase_client()
        result = (
            supabase
            .table(TABLE_NAME)
            .insert({"name": payload.name, "note": payload.note})
            .execute()
        )
        return {"ok": True, "data": result.data}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to insert data: {exc}")


@app.get("/api/test-data")
def list_test_data():
    """Read all testing data from Supabase."""
    try:
        supabase = get_supabase_client()
        result = supabase.table(TABLE_NAME).select("*").order("id", desc=True).execute()
        return {"ok": True, "count": len(result.data or []), "data": result.data}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {exc}")


@app.get("/api/ai-report/latest")
def get_latest_ai_report(overall_status: Optional[str] = None):
    """Read latest AI report bundle, optionally filtered by overall_status."""
    try:
        supabase = get_supabase_client()

        normalized_status = (overall_status or "").strip().lower()
        query = (
            supabase
            .table("ai_reports")
            .select("*")
        )
        if normalized_status:
            query = query.eq("overall_status", normalized_status)

        report_data = (
            query
            .order("created_at", desc=True)
            .limit(1)
            .execute()
            .data
        )

        if not report_data:
            return {
                "ok": True,
                "report": None,
                "analysis_results": [],
                "recommendations": [],
            }

        report = report_data[0]
        if not isinstance(report, dict):
            raise HTTPException(status_code=500, detail="Invalid report payload from database")
        report_id = report["id"]

        # Fetch all tool results for this report
        analysis_results = (
            supabase
            .table("ai_tool_results")
            .select("*")
            .eq("report_id", report_id)
            .order("created_at", desc=False)
            .execute()
            .data
        )

        # Fetch all recommendations for this report
        recommendations = (
            supabase
            .table("ai_recommendations")
            .select("*")
            .eq("report_id", report_id)
            .order("sort_order", desc=False)
            .execute()
            .data
        )

        return {
            "ok": True,
            "report": report,
            "analysis_results": analysis_results or [],
            "recommendations": recommendations or [],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch latest AI report: {exc}")


@app.get("/api/ai-report/{report_id}")
def get_ai_report_by_id(report_id: str):
    """Fetch specific AI report by ID with all related data."""
    try:
        supabase = get_supabase_client()

        # Fetch report by specific ID
        report_data = (
            supabase
            .table("ai_reports")
            .select("*")
            .eq("id", report_id)
            .execute()
            .data
        )

        if not report_data:
            return {
                "ok": True,
                "report": None,
                "analysis_results": [],
                "recommendations": [],
            }

        report = report_data[0]
        if not isinstance(report, dict):
            raise HTTPException(status_code=500, detail="Invalid report payload from database")

        # Fetch all tool results for this report
        analysis_results = (
            supabase
            .table("ai_tool_results")
            .select("*")
            .eq("report_id", report_id)
            .order("created_at", desc=False)
            .execute()
            .data
        )

        # Fetch all recommendations for this report
        recommendations = (
            supabase
            .table("ai_recommendations")
            .select("*")
            .eq("report_id", report_id)
            .order("sort_order", desc=False)
            .execute()
            .data
        )

        return {
            "ok": True,
            "report": report,
            "analysis_results": analysis_results or [],
            "recommendations": recommendations or [],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AI report {report_id}: {exc}")


@app.get("/api/debug/reports")
def debug_list_reports():
    """Debug endpoint: list all reports in database."""
    try:
        supabase = get_supabase_client()
        reports = supabase.table("ai_reports").select("*").order("created_at", desc=True).execute().data
        return {
            "ok": True,
            "count": len(reports or []),
            "reports": reports or []
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list reports: {exc}")


@app.post("/api/analyze-image", response_model=AnalyzeImageResponse)
async def analyze_uploaded_image(file: UploadFile = File(...)):
    """Analyze uploaded image and return only plant existence, status, and one plant name."""
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image uploads are supported")

        original_suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=original_suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await file.read())

        result = None
        last_error = None
        try:
            for attempt in range(2):
                try:
                    print(f"Analyzing image attempt {attempt + 1}/2 with MIME type: {file.content_type}")
                    result = analyze_crop_image(temp_path, mime_type=file.content_type)
                    if result:
                        print(f"Analysis succeeded: {result}")
                        break
                except Exception as exc:
                    last_error = exc
                    print(f"Attempt {attempt + 1} failed: {exc}")
                    result = None
        finally:
            try:
                os.remove(temp_path)
            except OSError:
                pass

        if not result:
            if last_error is not None:
                print(f"Image analysis returned no result after retry: {last_error}")
            return {
                "has_plant": False,
                "overall_status": None,
                "overall_description": "Analysis unavailable. Please try again.",
                "plant_name": None,
            }

        return {
            "has_plant": bool(result.get("has_plant", False)),
            "overall_status": result.get("overall_status"),
            "overall_description": result.get("overall_description"),
            "plant_name": result.get("plant_name"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {exc}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)





