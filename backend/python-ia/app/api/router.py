from fastapi import APIRouter

router = APIRouter()

@router.post('/moderate')
async def moderate(payload: dict):
    """Endpoint de modération (mock)"""
    # TODO: appeler modèle de modération
    return {"result": "ok", "details": {}}

@router.get('/recommendations')
async def recommendations(user_id: int):
    """Endpoint de recommandations (mock)"""
    return {"user_id": user_id, "recommendations": []}
