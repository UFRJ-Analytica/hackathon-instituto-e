from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import emissoes, energia, industria, biocombustiveis

app = FastAPI(
    title="Instituto E – Descarbonização Industrial",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(emissoes.router, prefix="/emissoes", tags=["Emissões"])
app.include_router(energia.router, prefix="/energia", tags=["Energia"])
app.include_router(industria.router, prefix="/industria", tags=["Indústria"])
app.include_router(biocombustiveis.router, prefix="/biocombustiveis", tags=["Biocombustíveis"])


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
