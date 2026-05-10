try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv():
        return False


load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat import router as chat_router
from routers.emissoes.endpoint import router as emissoes_router
from routers.etanol import router as etanol_router
from routers.mercado.endpoint import router as mercado_router
from routers.pid import router as pid_router
from routers.pid.service import get_industries_generation_assets, get_pid_industrial_map

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

app.include_router(etanol_router)
app.include_router(chat_router)
app.include_router(pid_router)
app.include_router(emissoes_router)
app.include_router(mercado_router)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/inicio")
def inicio():
    return {}


@app.get("/infraestrutura")
def infraestrutura():
    return {}


@app.get("/industrias")
def industrias():
    return get_industries_generation_assets()


@app.get("/pid")
def pid():
    return {}


@app.get("/saiba-mais")
def saiba_mais():
    return {}
