from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException, Request
from logger import event_generator

router = APIRouter()

@router.get("/logs/{surneyName}/")
async def sse_logs(surneyName: str):
    return StreamingResponse(event_generator(surneyName), media_type="text/event-stream")
