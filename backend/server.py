from fastapi import FastAPI, APIRouter, HTTPException, Header, UploadFile, File, Form, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
import subprocess
import uuid
import secrets
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
for sub in ["apps", "videos", "video_thumbs", "music", "thumbnails"]:
    (UPLOAD_DIR / sub).mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

DEV_PASSWORD = os.environ.get("DEV_PASSWORD", "dev123")

# In-memory active dev token (simple single-password auth)
ACTIVE_TOKENS: set = set()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ----------- Models -----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class AppItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    category: str = "General"
    thumbnail_url: str = ""
    download_url: str = ""  # local /api/uploads/apps/xxx OR external https://...
    is_external: bool = False
    version: str = ""
    created_at: str = Field(default_factory=now_iso)


class BlogItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    thumbnail_url: str = ""
    external_url: str
    author: str = ""
    created_at: str = Field(default_factory=now_iso)


class VideoItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    video_url: str = ""  # local file URL or external
    thumbnail_url: str = ""
    is_embed: bool = False
    embed_code: str = ""  # iframe HTML embed if is_embed
    is_external: bool = False
    category: str = "General"
    created_at: str = Field(default_factory=now_iso)


class MusicItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    artist: str = ""
    description: str = ""
    music_url: str = ""
    thumbnail_url: str = ""
    is_embed: bool = False
    embed_code: str = ""
    is_external: bool = False
    genre: str = "General"
    created_at: str = Field(default_factory=now_iso)


# ----------- Auth helper -----------
class LoginRequest(BaseModel):
    password: str


def verify_dev(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing developer token")
    token = authorization.replace("Bearer ", "").strip()
    if token not in ACTIVE_TOKENS:
        raise HTTPException(status_code=401, detail="Invalid developer token")
    return token


@api_router.post("/dev/login")
async def dev_login(req: LoginRequest):
    if req.password != DEV_PASSWORD:
        raise HTTPException(status_code=401, detail="Password salah")
    token = secrets.token_urlsafe(32)
    ACTIVE_TOKENS.add(token)
    return {"token": token, "message": "OK"}


@api_router.get("/dev/verify")
async def dev_verify(token: str = Depends(verify_dev)):
    return {"valid": True}


# ----------- File upload -----------
ALLOWED_FOLDERS = {"apps", "videos", "music", "thumbnails"}


def _save_upload(file: UploadFile, folder: str) -> tuple[str, Path]:
    """Saves an UploadFile, returns (public_url, full_path)."""
    safe_name = file.filename.replace(" ", "_").replace("/", "_")
    unique = f"{uuid.uuid4().hex[:10]}_{safe_name}"
    dest = UPLOAD_DIR / folder / unique
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    return f"/api/uploads/{folder}/{unique}", dest


def _generate_video_thumbnail(video_path: Path) -> Optional[str]:
    """Use ffmpeg to extract first frame at 1s. Returns public URL or None."""
    thumb_name = f"{video_path.stem}.jpg"
    thumb_path = UPLOAD_DIR / "video_thumbs" / thumb_name
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-ss", "00:00:01", "-i", str(video_path),
                "-frames:v", "1", "-q:v", "3", str(thumb_path)
            ],
            check=True, capture_output=True, timeout=30
        )
        if thumb_path.exists():
            return f"/api/uploads/video_thumbs/{thumb_name}"
    except Exception as e:
        logging.warning(f"ffmpeg thumbnail generation failed: {e}")
    return None


@api_router.post("/upload")
async def upload_file(
    folder: str = Form(...),
    file: UploadFile = File(...),
    token: str = Depends(verify_dev)
):
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Invalid folder")
    url, full_path = _save_upload(file, folder)
    result = {"url": url}
    if folder == "videos":
        thumb_url = _generate_video_thumbnail(full_path)
        if thumb_url:
            result["thumbnail_url"] = thumb_url
    return result


# ----------- Apps endpoints -----------
@api_router.get("/apps")
async def list_apps(q: Optional[str] = None):
    query = {}
    if q:
        query = {"$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
        ]}
    items = await db.apps.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/apps")
async def create_app(item: AppItem, token: str = Depends(verify_dev)):
    doc = item.model_dump()
    await db.apps.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/apps/{item_id}")
async def delete_app(item_id: str, token: str = Depends(verify_dev)):
    res = await db.apps.delete_one({"id": item_id})
    return {"deleted": res.deleted_count}


# ----------- Blogs endpoints -----------
@api_router.get("/blogs")
async def list_blogs(q: Optional[str] = None):
    query = {}
    if q:
        query = {"$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"author": {"$regex": q, "$options": "i"}},
        ]}
    items = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/blogs")
async def create_blog(item: BlogItem, token: str = Depends(verify_dev)):
    doc = item.model_dump()
    await db.blogs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/blogs/{item_id}")
async def delete_blog(item_id: str, token: str = Depends(verify_dev)):
    res = await db.blogs.delete_one({"id": item_id})
    return {"deleted": res.deleted_count}


# ----------- Videos endpoints -----------
@api_router.get("/videos")
async def list_videos(q: Optional[str] = None):
    query = {}
    if q:
        query = {"$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
        ]}
    items = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/videos")
async def create_video(item: VideoItem, token: str = Depends(verify_dev)):
    doc = item.model_dump()
    await db.videos.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/videos/{item_id}")
async def delete_video(item_id: str, token: str = Depends(verify_dev)):
    res = await db.videos.delete_one({"id": item_id})
    return {"deleted": res.deleted_count}


# ----------- Music endpoints -----------
@api_router.get("/music")
async def list_music(q: Optional[str] = None):
    query = {}
    if q:
        query = {"$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"artist": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"genre": {"$regex": q, "$options": "i"}},
        ]}
    items = await db.music.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/music")
async def create_music(item: MusicItem, token: str = Depends(verify_dev)):
    doc = item.model_dump()
    await db.music.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/music/{item_id}")
async def delete_music(item_id: str, token: str = Depends(verify_dev)):
    res = await db.music.delete_one({"id": item_id})
    return {"deleted": res.deleted_count}


# ----------- Global search -----------
@api_router.get("/search")
async def global_search(q: str):
    regex = {"$regex": q, "$options": "i"}
    or_block = [
        {"title": regex}, {"description": regex},
    ]
    apps = await db.apps.find({"$or": or_block + [{"category": regex}]}, {"_id": 0}).to_list(100)
    blogs = await db.blogs.find({"$or": or_block + [{"author": regex}]}, {"_id": 0}).to_list(100)
    videos = await db.videos.find({"$or": or_block + [{"category": regex}]}, {"_id": 0}).to_list(100)
    music = await db.music.find({"$or": or_block + [{"artist": regex}, {"genre": regex}]}, {"_id": 0}).to_list(100)
    return {"apps": apps, "blogs": blogs, "videos": videos, "music": music}


@api_router.get("/")
async def root():
    return {"message": "Fun Center API", "status": "ok"}


# ----------- File serving -----------
@api_router.get("/uploads/{folder}/{filename}")
async def serve_upload(folder: str, filename: str):
    if folder not in {"apps", "videos", "video_thumbs", "music", "thumbnails"}:
        raise HTTPException(status_code=404, detail="Not found")
    file_path = UPLOAD_DIR / folder / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    # Force download for apps folder
    if folder == "apps":
        return FileResponse(file_path, filename=filename, media_type="application/octet-stream")
    return FileResponse(file_path)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
