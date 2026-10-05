from fastapi import APIRouter
from backend.app.api.auth_router import router as auth_router
from backend.app.api.chat_router import router as chat_router
from backend.app.api.kb_router import router as kb_router
from backend.app.api.admin_router import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(kb_router)
api_router.include_router(admin_router)
