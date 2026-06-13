"""Fun Center API backend tests.
Covers: health, dev auth, apps/blogs/videos/music CRUD with auth, file upload + ffmpeg thumbnail, search, file serving."""
import os
import io
import subprocess
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://entertainment-vault-17.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# --- Fixtures ---
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/dev/login", json={"password": "dev123"}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def sample_video_path(tmp_path_factory):
    """Generate small 2s mp4 with ffmpeg for upload tests."""
    p = tmp_path_factory.mktemp("v") / "sample.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", "testsrc=duration=2:size=320x240:rate=10",
         "-pix_fmt", "yuv420p", str(p)],
        check=True, capture_output=True, timeout=30,
    )
    return p


# --- Health & Auth ---
class TestHealthAuth:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/dev/login", json={"password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_login_correct(self, session):
        r = session.post(f"{API}/dev/login", json={"password": "dev123"}, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json().get("token"), str) and len(r.json()["token"]) > 10

    def test_verify_endpoint(self, session, auth_headers):
        r = session.get(f"{API}/dev/verify", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json().get("valid") is True

    def test_protected_requires_auth(self, session):
        # POST blogs without auth must be 401
        r = session.post(f"{API}/blogs", json={"title": "x", "external_url": "https://e.com"}, timeout=15)
        assert r.status_code == 401
        r = session.post(f"{API}/apps", json={"title": "x"}, timeout=15)
        assert r.status_code == 401
        r = session.post(f"{API}/videos", json={"title": "x"}, timeout=15)
        assert r.status_code == 401
        r = session.post(f"{API}/music", json={"title": "x"}, timeout=15)
        assert r.status_code == 401


# --- Blogs CRUD ---
class TestBlogs:
    def test_create_and_get(self, session, auth_headers):
        payload = {
            "title": "TEST_Blog_1",
            "description": "test desc",
            "external_url": "https://example.com/post",
            "thumbnail_url": "https://example.com/t.jpg",
            "author": "TEST_author",
        }
        r = session.post(f"{API}/blogs", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["title"] == payload["title"]
        assert created["external_url"] == payload["external_url"]
        assert "id" in created
        # GET list verifies persistence
        r = session.get(f"{API}/blogs", timeout=15)
        assert r.status_code == 200
        ids = [b["id"] for b in r.json()]
        assert created["id"] in ids
        # cleanup
        d = session.delete(f"{API}/blogs/{created['id']}", headers=auth_headers, timeout=15)
        assert d.status_code == 200
        assert d.json().get("deleted") == 1

    def test_delete_requires_auth(self, session):
        r = session.delete(f"{API}/blogs/nonexistent", timeout=15)
        assert r.status_code == 401


# --- Apps CRUD ---
class TestApps:
    def test_create_external(self, session, auth_headers):
        payload = {
            "title": "TEST_App_External",
            "description": "ext app",
            "category": "Productivity",
            "download_url": "https://example.com/app.zip",
            "is_external": True,
            "version": "1.0",
        }
        r = session.post(f"{API}/apps", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["title"] == payload["title"]
        # search filter via q
        r = session.get(f"{API}/apps", params={"q": "TEST_App_External"}, timeout=15)
        assert r.status_code == 200
        assert any(a["id"] == created["id"] for a in r.json())
        # cleanup
        session.delete(f"{API}/apps/{created['id']}", headers=auth_headers, timeout=15)


# --- Videos CRUD ---
class TestVideos:
    def test_create_with_embed(self, session, auth_headers):
        payload = {
            "title": "TEST_Video_Embed",
            "description": "test",
            "is_embed": True,
            "embed_code": "<iframe src='https://www.youtube.com/embed/abc'></iframe>",
            "category": "Tech",
        }
        r = session.post(f"{API}/videos", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        created = r.json()
        assert created["is_embed"] is True
        r = session.get(f"{API}/videos", timeout=15)
        assert created["id"] in [v["id"] for v in r.json()]
        session.delete(f"{API}/videos/{created['id']}", headers=auth_headers, timeout=15)


# --- Music CRUD ---
class TestMusic:
    def test_create_external(self, session, auth_headers):
        payload = {
            "title": "TEST_Music_1",
            "artist": "TEST_Artist",
            "music_url": "https://example.com/song.mp3",
            "is_external": True,
            "genre": "Pop",
        }
        r = session.post(f"{API}/music", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        created = r.json()
        assert created["artist"] == "TEST_Artist"
        r = session.get(f"{API}/music", timeout=15)
        assert created["id"] in [m["id"] for m in r.json()]
        session.delete(f"{API}/music/{created['id']}", headers=auth_headers, timeout=15)


# --- Upload + Serving + ffmpeg thumbnail ---
class TestUpload:
    def test_upload_requires_auth(self, session):
        files = {"file": ("x.png", b"abc", "image/png")}
        r = session.post(f"{API}/upload", data={"folder": "thumbnails"}, files=files, timeout=30)
        assert r.status_code == 401

    def test_upload_thumbnail_and_serve(self, session, auth_headers):
        # tiny valid PNG (1x1)
        png = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489"
            "0000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("test_thumb.png", png, "image/png")}
        r = session.post(f"{API}/upload", data={"folder": "thumbnails"},
                         files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("/api/uploads/thumbnails/")
        # Serve it back
        served = session.get(f"{BASE_URL}{url}", timeout=15)
        assert served.status_code == 200
        assert len(served.content) > 0

    def test_upload_invalid_folder(self, session, auth_headers):
        files = {"file": ("x.png", b"abc", "image/png")}
        r = session.post(f"{API}/upload", data={"folder": "evil"},
                         files=files, headers=auth_headers, timeout=15)
        assert r.status_code == 400

    def test_upload_video_generates_thumbnail(self, session, auth_headers, sample_video_path):
        with open(sample_video_path, "rb") as fp:
            files = {"file": ("sample.mp4", fp, "video/mp4")}
            r = session.post(f"{API}/upload", data={"folder": "videos"},
                             files=files, headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["url"].startswith("/api/uploads/videos/")
        # ffmpeg thumbnail
        assert "thumbnail_url" in body, f"Expected thumbnail_url in response: {body}"
        assert body["thumbnail_url"].startswith("/api/uploads/video_thumbs/")
        # serving the thumbnail
        served = session.get(f"{BASE_URL}{body['thumbnail_url']}", timeout=15)
        assert served.status_code == 200
        # serving the video file
        vid_served = session.get(f"{BASE_URL}{body['url']}", timeout=30)
        assert vid_served.status_code == 200

    def test_serve_missing_file_404(self, session):
        r = session.get(f"{API}/uploads/thumbnails/does-not-exist.png", timeout=15)
        assert r.status_code == 404


# --- Global search ---
class TestSearch:
    def test_search_returns_buckets(self, session, auth_headers):
        # Seed something searchable
        payload = {"title": "TEST_SearchSeed_zzx", "external_url": "https://e.com/x", "author": "qa"}
        r = session.post(f"{API}/blogs", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        bid = r.json()["id"]
        try:
            r = session.get(f"{API}/search", params={"q": "TEST_SearchSeed_zzx"}, timeout=15)
            assert r.status_code == 200
            data = r.json()
            assert set(data.keys()) >= {"apps", "blogs", "videos", "music"}
            assert any(b["id"] == bid for b in data["blogs"])
        finally:
            session.delete(f"{API}/blogs/{bid}", headers=auth_headers, timeout=15)
