import os
from unittest.mock import patch, AsyncMock
from app.services.ai_service import (
    GeminiProvider,
    OpenAIProvider,
    UnconfiguredAIProvider,
    AIExtractorService,
)

def test_provider_selection():
    print("[1] Testing provider selection based on environment variables...")
    
    # 1. No keys -> UnconfiguredAIProvider
    with patch.dict(os.environ, {"GEMINI_API_KEY": "", "OPENAI_API_KEY": ""}, clear=False):
        provider = AIExtractorService.get_provider()
        assert isinstance(provider, UnconfiguredAIProvider)
        assert provider.name == "none"
        status = AIExtractorService.get_status()
        assert status.configured is False

    # 2. GEMINI_API_KEY present -> GeminiProvider
    with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyTestGeminiKey123", "OPENAI_API_KEY": ""}, clear=False):
        provider = AIExtractorService.get_provider()
        assert isinstance(provider, GeminiProvider)
        assert provider.name == "gemini"
        status = AIExtractorService.get_status()
        assert status.configured is True
        assert status.provider == "gemini"

    # 3. OPENAI_API_KEY present -> OpenAIProvider
    with patch.dict(os.environ, {"GEMINI_API_KEY": "", "OPENAI_API_KEY": "sk-testOpenAIKey123"}, clear=False):
        provider = AIExtractorService.get_provider()
        assert isinstance(provider, OpenAIProvider)
        assert provider.name == "openai"
        status = AIExtractorService.get_status()
        assert status.configured is True
        assert status.provider == "openai"

    print("  -> Provider factory correctly selects Gemini, OpenAI, or Unconfigured.")

def test_gemini_parsing_mock():
    print("\n[2] Testing Gemini response parsing and validation...")
    gemini = GeminiProvider(api_key="mock_key", model="gemini-2.5-flash")
    
    mock_payload = {
        "title": "Quantum Machine Learning Colloquium",
        "category": "Tech Talk",
        "organizer": "Stanford Quantum Computing Club",
        "start_date": "2026-11-25",
        "start_time": "03:00 PM",
        "end_date": "2026-11-25",
        "end_time": "05:00 PM",
        "venue": "Varian Physics Hall",
        "room": "Room 108",
        "description": "Lecture on parameterized quantum circuits.",
        "registration_deadline": "2026-11-23",
        "registration_link": "https://campus.edu/quantum-colloquium",
        "tags": ["Quantum", "ML", "Physics"],
        "suggested_tasks": ["Read introduction to variational algorithms"],
        "confidence_score": 0.96,
        "uncertain_fields": []
    }

    with patch.object(gemini, "_call_gemini", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_payload
        import asyncio
        result = asyncio.run(gemini.extract_from_text("Dummy announcement"))
        
        assert result.title == "Quantum Machine Learning Colloquium"
        assert result.category == "Tech Talk"
        assert result.start_date == "2026-11-25"
        assert result.registration_deadline == "2026-11-23"
        assert result.registration_link == "https://campus.edu/quantum-colloquium"
        assert result.is_ai_powered is True
        assert result.provider == "gemini"
        assert len(result.missing_fields) == 0

    print("  -> Gemini structured output correctly parsed and validated.")

def test_openai_parsing_mock():
    print("\n[3] Testing OpenAI response parsing and validation...")
    openai = OpenAIProvider(api_key="mock_key", model="gpt-4o-mini")
    
    mock_payload = {
        "title": "Collegiate Cybersecurity CTF",
        "category": "Hackathon",
        "organizer": "Security Society",
        "start_date": "2026-12-05",
        "start_time": "09:00 AM",
        "end_date": "2026-12-06",
        "end_time": "09:00 PM",
        "venue": "Turing Lab",
        "description": "48-hour CTF challenge.",
        "registration_deadline": None,
        "registration_link": None,
        "tags": ["Security", "CTF"],
        "suggested_tasks": ["Set up Kali VM and Burp Suite"],
        "confidence_score": 0.92,
        "uncertain_fields": ["registration_deadline"]
    }

    with patch.object(openai, "_call_openai", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = mock_payload
        import asyncio
        result = asyncio.run(openai.extract_from_text("Dummy announcement"))
        
        assert result.title == "Collegiate Cybersecurity CTF"
        assert result.category == "Hackathon"
        assert result.registration_deadline is None
        assert "registration_deadline" in result.missing_fields
        assert result.is_ai_powered is True
        assert result.provider == "openai"

    print("  -> OpenAI structured output correctly parsed and validated without fabricated deadline.")

if __name__ == "__main__":
    test_provider_selection()
    test_gemini_parsing_mock()
    test_openai_parsing_mock()
    print("\n[SUCCESS] ALL PROVIDER UNIT TESTS PASSED SUCCESSFULLY!")
