"""
Real AI-Powered Event Importer Service for MyCampus
---------------------------------------------------
Provides maintainable provider abstraction supporting:
1. Google Gemini (via GEMINI_API_KEY) - gemini-2.5-flash / gemini-1.5-flash
2. OpenAI (via OPENAI_API_KEY) - gpt-4o-mini / gpt-4o
3. Unconfigured Provider - returns transparent, honest status when no key is set.

Does NOT fabricate dates, deadlines, or locations.
Validates dates, times, and URLs deterministically.
"""

import os
import re
import json
import base64
import io
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import httpx
from PIL import Image

from ..schemas import AIParseResult, AIStatusResponse

ALLOWED_CATEGORIES = {
    "Hackathon",
    "Tech Talk",
    "Workshop",
    "Cultural",
    "Career",
    "Sports",
    "Academic",
}

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_MIMES = {
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/webp": "WEBP",
    "image/gif": "GIF",
}

EXTRACTION_SYSTEM_PROMPT = """You are an accurate campus event information extraction engine.
Analyze the provided event announcement text or poster image and extract structured event information.

CRITICAL RULES:
1. DO NOT INVENT OR FABRICATE DATA. If an event detail is not present in the input, return null for that field.
2. DO NOT GUESS OR INVENT YEARS: If a date says "November 14" without a year, use the next upcoming occurrence or return null if uncertain, and list "start_date" in uncertain_fields.
3. DO NOT INVENT REGISTRATION DEADLINES: If no deadline is explicitly mentioned, return null.
4. DO NOT INVENT REGISTRATION LINKS: If no URL is provided, return null.
5. ONLY select category from: "Hackathon", "Tech Talk", "Workshop", "Cultural", "Career", "Sports", "Academic". If unsure, pick the closest or null.
6. Return a valid JSON object matching this exact schema:
{
  "title": string or null,
  "category": string or null,
  "organizer": string or null,
  "start_date": "YYYY-MM-DD" or null,
  "start_time": string (e.g. "10:00 AM") or null,
  "end_date": "YYYY-MM-DD" or null,
  "end_time": string (e.g. "04:30 PM") or null,
  "venue": string or null,
  "room": string or null,
  "description": string or null,
  "registration_deadline": "YYYY-MM-DD" or null,
  "registration_link": string (full URL) or null,
  "registration_fee": string or null,
  "tags": [string],
  "suggested_tasks": [string],
  "confidence_score": float between 0.0 and 1.0,
  "uncertain_fields": [string],
  "extracted_text": string summary of what was read
}
"""

def validate_iso_date(date_str: Optional[str]) -> bool:
    """Validates if date_str is a real calendar date in YYYY-MM-DD format."""
    if not date_str or not isinstance(date_str, str):
        return False
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_str.strip()):
        return False
    try:
        datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return True
    except ValueError:
        return False

def validate_url(url_str: Optional[str]) -> bool:
    """Validates if url_str is a valid HTTP/HTTPS URL."""
    if not url_str or not isinstance(url_str, str):
        return False
    clean = url_str.strip()
    return bool(re.match(r"^https?://[a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=%]+$", clean))

def sanitize_and_validate_extraction(
    raw_data: Dict[str, Any],
    provider_name: str,
    model_name: Optional[str] = None,
    is_ai: bool = True
) -> AIParseResult:
    """
    Validates, normalizes, and audits raw extraction output.
    Ensures missing fields are null, validates dates and URLs,
    and identifies all missing/uncertain fields.
    """
    title = raw_data.get("title")
    title = str(title).strip() if title else None

    # Validate category
    cat = raw_data.get("category")
    category = cat if cat in ALLOWED_CATEGORIES else None

    organizer = raw_data.get("organizer")
    organizer = str(organizer).strip() if organizer else None

    # Validate start_date
    raw_start_date = raw_data.get("start_date")
    start_date = raw_start_date if validate_iso_date(raw_start_date) else None

    start_time = raw_data.get("start_time")
    start_time = str(start_time).strip() if start_time else None

    # Validate end_date
    raw_end_date = raw_data.get("end_date")
    end_date = raw_end_date if validate_iso_date(raw_end_date) else None

    end_time = raw_data.get("end_time")
    end_time = str(end_time).strip() if end_time else None

    venue = raw_data.get("venue")
    venue = str(venue).strip() if venue else None

    room = raw_data.get("room")
    room = str(room).strip() if room else None

    description = raw_data.get("description")
    description = str(description).strip() if description else None

    # Validate registration_deadline
    raw_deadline = raw_data.get("registration_deadline")
    registration_deadline = raw_deadline if validate_iso_date(raw_deadline) else None

    # Validate registration_link
    raw_link = raw_data.get("registration_link")
    registration_link = raw_link if validate_url(raw_link) else None

    registration_fee = raw_data.get("registration_fee")
    registration_fee = str(registration_fee).strip() if registration_fee else None

    tags = raw_data.get("tags") or []
    if not isinstance(tags, list):
        tags = []
    tags = [str(t).strip() for t in tags if str(t).strip()]

    tasks = raw_data.get("suggested_tasks") or []
    if not isinstance(tasks, list):
        tasks = []
    suggested_tasks = [str(t).strip() for t in tasks if str(t).strip()]

    confidence = raw_data.get("confidence_score", 0.85 if is_ai else 0.5)
    try:
        confidence = float(confidence)
    except (TypeError, ValueError):
        confidence = 0.5

    uncertain_fields = raw_data.get("uncertain_fields") or []
    if not isinstance(uncertain_fields, list):
        uncertain_fields = []
    uncertain_fields = [str(f) for f in uncertain_fields]

    # Compute missing fields
    missing_fields: List[str] = []
    if not title:
        missing_fields.append("title")
    if not start_date:
        missing_fields.append("start_date")
    if not start_time:
        missing_fields.append("start_time")
    if not venue:
        missing_fields.append("venue")
    if not registration_deadline:
        missing_fields.append("registration_deadline")
    if not registration_link:
        missing_fields.append("registration_link")
    if not end_date:
        missing_fields.append("end_date")
    if not end_time:
        missing_fields.append("end_time")

    banner_image = raw_data.get("banner_image")
    extracted_text = raw_data.get("extracted_text")

    return AIParseResult(
        title=title,
        category=category,
        organizer=organizer,
        start_date=start_date,
        start_time=start_time,
        end_date=end_date,
        end_time=end_time,
        venue=venue,
        room=room,
        description=description,
        registration_deadline=registration_deadline,
        registration_link=registration_link,
        registration_fee=registration_fee,
        tags=tags,
        suggested_tasks=suggested_tasks,
        confidence_score=confidence,
        banner_image=banner_image,
        extracted_text=extracted_text,
        missing_fields=missing_fields,
        uncertain_fields=uncertain_fields,
        is_ai_powered=is_ai,
        provider=provider_name,
        model=model_name,
    )


class BaseAIProvider(ABC):
    """Abstract base class for all AI Extraction Providers."""
    name: str
    model: str

    @abstractmethod
    async def extract_from_text(self, text: str) -> AIParseResult:
        pass

    @abstractmethod
    async def extract_from_image(self, image_bytes: bytes, mime_type: str, image_name: str) -> AIParseResult:
        pass


class GeminiProvider(BaseAIProvider):
    """
    Google Gemini Multimodal AI Provider using official Gemini REST API.
    Supports text extraction and native image vision OCR.
    """
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.name = "gemini"
        self.model = os.getenv("GEMINI_MODEL", model)
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    async def _call_gemini(self, contents: list) -> Dict[str, Any]:
        params = {"key": self.api_key}
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": EXTRACTION_SYSTEM_PROMPT}]
            },
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1,
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(self.endpoint, params=params, json=payload)
            if resp.status_code != 200:
                error_detail = resp.text
                try:
                    err_json = resp.json()
                    error_detail = err_json.get("error", {}).get("message", error_detail)
                except Exception:
                    pass
                raise ValueError(f"Gemini API error (HTTP {resp.status_code}): {error_detail}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("Gemini returned no candidates.")

            text_output = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            # Parse JSON
            try:
                return json.loads(text_output)
            except json.JSONDecodeError:
                # Strip markdown blocks if present
                clean = re.sub(r"^```(?:json)?\s*", "", text_output.strip())
                clean = re.sub(r"\s*```$", "", clean)
                return json.loads(clean)

    async def extract_from_text(self, text: str) -> AIParseResult:
        try:
            prompt = f"Please extract all campus event details from the following announcement text:\n\n{text}"
            contents = [
                {"parts": [{"text": prompt}]}
            ]
            raw_result = await self._call_gemini(contents)
            raw_result["extracted_text"] = f"Gemini ({self.model}) text extraction"
            return sanitize_and_validate_extraction(raw_result, self.name, self.model, is_ai=True)
        except Exception as e:
            fallback = await UnconfiguredAIProvider().extract_from_text(text)
            fallback.error_message = f"Gemini API call ({self.model}) failed: {str(e)}. Review and complete fields manually."
            return fallback

    async def extract_from_image(self, image_bytes: bytes, mime_type: str, image_name: str) -> AIParseResult:
        try:
            b64_data = base64.b64encode(image_bytes).decode("utf-8")
            contents = [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_data,
                            }
                        },
                        {
                            "text": f"Extract all campus event details from this uploaded poster/flyer named '{image_name}'."
                        }
                    ]
                }
            ]
            raw_result = await self._call_gemini(contents)
            raw_result["extracted_text"] = f"Gemini Vision ({self.model}) scanned '{image_name}'"
            return sanitize_and_validate_extraction(raw_result, self.name, self.model, is_ai=True)
        except Exception as e:
            fallback = await UnconfiguredAIProvider().extract_from_image(image_bytes, mime_type, image_name)
            fallback.error_message = f"Gemini Vision call ({self.model}) failed: {str(e)}. Enter details manually."
            return fallback


class OpenAIProvider(BaseAIProvider):
    """
    OpenAI Multimodal AI Provider using Chat Completions API.
    Supports text extraction and native image vision.
    """
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.name = "openai"
        self.model = os.getenv("OPENAI_MODEL", model)
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def _call_openai(self, messages: list) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                *messages,
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(self.endpoint, headers=headers, json=payload)
            if resp.status_code != 200:
                error_detail = resp.text
                try:
                    err_json = resp.json()
                    error_detail = err_json.get("error", {}).get("message", error_detail)
                except Exception:
                    pass
                raise ValueError(f"OpenAI API error (HTTP {resp.status_code}): {error_detail}")

            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)

    async def extract_from_text(self, text: str) -> AIParseResult:
        messages = [
            {"role": "user", "content": f"Extract campus event information from this announcement:\n\n{text}"}
        ]
        raw_result = await self._call_openai(messages)
        raw_result["extracted_text"] = f"OpenAI ({self.model}) text extraction"
        return sanitize_and_validate_extraction(raw_result, self.name, self.model, is_ai=True)

    async def extract_from_image(self, image_bytes: bytes, mime_type: str, image_name: str) -> AIParseResult:
        b64_data = base64.b64encode(image_bytes).decode("utf-8")
        data_uri = f"data:{mime_type};base64,{b64_data}"
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Extract all campus event details from this uploaded flyer '{image_name}'."},
                    {"type": "image_url", "image_url": {"url": data_uri}}
                ]
            }
        ]
        raw_result = await self._call_openai(messages)
        raw_result["extracted_text"] = f"OpenAI Vision ({self.model}) scanned '{image_name}'"
        return sanitize_and_validate_extraction(raw_result, self.name, self.model, is_ai=True)


class UnconfiguredAIProvider(BaseAIProvider):
    """
    Fallback provider when no AI API key is configured.
    Does NOT pretend to be an AI model.
    Does NOT fabricate dates, deadlines, or locations.
    """
    def __init__(self):
        self.name = "none"
        self.model = "none"

    async def extract_from_text(self, text: str) -> AIParseResult:
        raw = text.strip()
        lines = [line.strip().lstrip("#*🚀🎉🗓- ") for line in raw.split("\n") if line.strip()]
        title_candidate = lines[0] if lines and len(lines[0]) <= 100 else None

        # Look for explicit URLs
        url_match = re.search(r"https?://[^\s]+", raw)
        found_url = url_match.group(0) if url_match and validate_url(url_match.group(0)) else None

        # Detect category keywords without fabricating dates
        lower = raw.lower()
        category = None
        if any(k in lower for k in ("hack", "devpost")):
            category = "Hackathon"
        elif any(k in lower for k in ("workshop", "hands-on")):
            category = "Workshop"
        elif any(k in lower for k in ("career", "fair", "intern", "resume")):
            category = "Career"
        elif any(k in lower for k in ("concert", "music", "fest")):
            category = "Cultural"
        elif any(k in lower for k in ("tournament", "match", "sports")):
            category = "Sports"
        elif any(k in lower for k in ("research", "symposium", "phd")):
            category = "Academic"
        elif any(k in lower for k in ("talk", "tech", "ai", "keynote")):
            category = "Tech Talk"

        raw_result = {
            "title": title_candidate,
            "category": category,
            "organizer": None,
            "start_date": None,
            "start_time": None,
            "end_date": None,
            "end_time": None,
            "venue": None,
            "room": None,
            "description": raw[:300].strip() if raw else None,
            "registration_deadline": None,
            "registration_link": found_url,
            "tags": [category] if category else [],
            "suggested_tasks": [],
            "confidence_score": 0.35,
            "extracted_text": "Note: AI Provider not configured. Manual review required.",
            "uncertain_fields": ["start_date", "start_time", "venue", "registration_deadline"]
        }

        res = sanitize_and_validate_extraction(raw_result, self.name, None, is_ai=False)
        res.error_message = (
            "No AI provider configured. To enable automated AI extraction, "
            "set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env. "
            "Event fields must be verified manually."
        )
        return res

    async def extract_from_image(self, image_bytes: bytes, mime_type: str, image_name: str) -> AIParseResult:
        clean_name = image_name.rsplit(".", 1)[0].replace("-", " ").replace("_", " ")
        raw_result = {
            "title": clean_name.title() if len(clean_name) > 3 else None,
            "category": None,
            "organizer": None,
            "start_date": None,
            "start_time": None,
            "end_date": None,
            "end_time": None,
            "venue": None,
            "room": None,
            "description": f"Uploaded flyer: {image_name}",
            "registration_deadline": None,
            "registration_link": None,
            "tags": [],
            "suggested_tasks": [],
            "confidence_score": 0.2,
            "extracted_text": "Note: AI Vision Provider not configured. Image metadata only.",
            "uncertain_fields": ["title", "start_date", "venue"]
        }

        res = sanitize_and_validate_extraction(raw_result, self.name, None, is_ai=False)
        res.error_message = (
            "No AI Vision provider configured. To enable flyer OCR extraction, "
            "set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env. "
            "Event details must be entered manually."
        )
        return res


class AIExtractorService:
    """
    Main entrypoint service for the AI Event Importer.
    Orchestrates provider selection, image validation, and extraction execution.
    """

    @staticmethod
    def get_provider() -> BaseAIProvider:
        from dotenv import load_dotenv
        load_dotenv()
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"\'')
        openai_key = os.getenv("OPENAI_API_KEY", "").strip().strip('"\'')

        if gemini_key:
            return GeminiProvider(api_key=gemini_key)
        elif openai_key:
            return OpenAIProvider(api_key=openai_key)
        else:
            return UnconfiguredAIProvider()

    @staticmethod
    def get_status() -> AIStatusResponse:
        from dotenv import load_dotenv
        load_dotenv()
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"\'')
        openai_key = os.getenv("OPENAI_API_KEY", "").strip().strip('"\'')

        if gemini_key:
            model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip().strip('"\'')
            return AIStatusResponse(
                configured=True,
                provider="gemini",
                model=model,
                supported_inputs=["text", "image"],
                message=f"Google Gemini Vision ({model}) active and ready."
            )
        elif openai_key:
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip().strip('"\'')
            return AIStatusResponse(
                configured=True,
                provider="openai",
                model=model,
                supported_inputs=["text", "image"],
                message=f"OpenAI Vision ({model}) active and ready."
            )
        else:
            return AIStatusResponse(
                configured=False,
                provider="none",
                model=None,
                supported_inputs=["text", "image"],
                message="No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env to activate real AI extraction."
            )

    @classmethod
    async def parse_announcement(cls, announcement_text: str) -> AIParseResult:
        if not announcement_text or not announcement_text.strip():
            raise ValueError("Announcement text cannot be empty.")

        provider = cls.get_provider()
        return await provider.extract_from_text(announcement_text)

    @classmethod
    async def parse_flyer_image(cls, image_data: str, image_name: str = "flyer.png") -> AIParseResult:
        """
        Parses an image flyer. Supports:
        1. HTTP/HTTPS URLs (e.g. sample flyers)
        2. Data URIs (data:image/...;base64,...)
        3. Raw base64 image strings
        Validates size and format via Pillow.
        """
        if not image_data or not image_data.strip():
            raise ValueError("Image data cannot be empty.")

        provider = cls.get_provider()

        # Handle HTTP / HTTPS URL
        if image_data.startswith("http://") or image_data.startswith("https://"):
            if not validate_url(image_data):
                raise ValueError("Invalid image URL provided.")

            if isinstance(provider, (GeminiProvider, OpenAIProvider)):
                try:
                    async with httpx.AsyncClient(timeout=20.0) as http_client:
                        resp = await http_client.get(image_data)
                        if resp.status_code == 200:
                            image_bytes = resp.content
                            mime_type = resp.headers.get("content-type", "image/jpeg").split(";")[0].lower()
                            if mime_type not in ALLOWED_IMAGE_MIMES:
                                mime_type = "image/jpeg"
                            result = await provider.extract_from_image(image_bytes, mime_type, image_name or "flyer.png")
                            result.banner_image = image_data
                            return result
                except Exception as e:
                    # If network fetch fails, continue to image_name analysis
                    pass

            result = await provider.extract_from_image(b"", "image/jpeg", image_name or "flyer.png")
            result.banner_image = image_data
            return result

        mime_type = "image/png"
        raw_b64 = image_data

        # Parse Data URI scheme
        if image_data.startswith("data:"):
            parts = image_data.split(",", 1)
            header = parts[0]
            raw_b64 = parts[1] if len(parts) > 1 else ""
            mime_match = re.search(r"data:([^;]+);", header)
            if mime_match:
                mime_type = mime_match.group(1).lower()

        # Validate MIME type
        if mime_type not in ALLOWED_IMAGE_MIMES:
            raise ValueError(f"Unsupported image type '{mime_type}'. Supported: PNG, JPEG, WEBP, GIF.")

        try:
            image_bytes = base64.b64decode(raw_b64)
        except Exception:
            raise ValueError("Invalid base64-encoded image data.")

        # Validate file size
        if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise ValueError(f"Image exceeds maximum allowable size of 10MB ({len(image_bytes) / (1024*1024):.1f} MB uploaded).")

        # Validate image headers and dimensions using Pillow
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                img.verify()
        except Exception as e:
            raise ValueError(f"Invalid or corrupted image file: {str(e)}")

        result = await provider.extract_from_image(image_bytes, mime_type, image_name or "flyer.png")
        result.banner_image = image_data if len(image_data) < 2000000 else None
        return result
