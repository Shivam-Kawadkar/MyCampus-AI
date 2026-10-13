from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import (
    AIParsedAnnouncementRequest,
    AIParsedImageRequest,
    AIParseResult,
    AIStatusResponse,
)
from ..services.ai_service import AIExtractorService
from ..auth import get_current_demo_user, DemoAccountInfo

router = APIRouter(prefix="/api/ai", tags=["AI Event Importer"])

@router.get("/status", response_model=AIStatusResponse)
def get_ai_status():
    """
    Returns current AI extraction status, active provider, and supported inputs.
    """
    return AIExtractorService.get_status()

@router.post("/parse-event", response_model=AIParseResult)
async def parse_announcement_text(
    req: AIParsedAnnouncementRequest,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
):
    """
    Parses raw event announcement text into structured event fields using
    configured AI Provider (Gemini / OpenAI) or rule-based fallback.
    """
    try:
        return await AIExtractorService.parse_announcement(req.announcement_text)
    except ValueError as e:
        err_str = str(e)
        if "503" in err_str or "unavailable" in err_str.lower() or "overloaded" in err_str.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Google Gemini is temporarily overloaded or unavailable. Please retry in a moment. ({err_str})"
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=err_str
        )
    except Exception as e:
        err_str = str(e)
        if "503" in err_str or "unavailable" in err_str.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Google Gemini service temporarily unavailable. Please retry. ({err_str})"
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Provider extraction failed: {err_str}"
        )

@router.post("/parse-image", response_model=AIParseResult)
async def parse_flyer_image(
    req: AIParsedImageRequest,
    current_user: DemoAccountInfo = Depends(get_current_demo_user),
):
    """
    Parses campus event poster or flyer image into structured event fields
    using configured Vision AI model or image metadata analysis.
    """
    try:
        return await AIExtractorService.parse_flyer_image(req.image_url, req.image_name or "flyer.png")
    except ValueError as e:
        err_str = str(e)
        if "503" in err_str or "unavailable" in err_str.lower() or "overloaded" in err_str.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Google Gemini Vision is temporarily overloaded or unavailable. Please retry in a moment. ({err_str})"
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=err_str
        )
    except Exception as e:
        err_str = str(e)
        if "503" in err_str or "unavailable" in err_str.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Google Gemini Vision service temporarily unavailable. Please retry. ({err_str})"
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Vision extraction failed: {err_str}"
        )
