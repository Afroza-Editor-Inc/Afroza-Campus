from fastapi import FastAPI
from .api import router as api_router

app = FastAPI(title="Afroza IA")

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health():
    return {"status":"ok"}
