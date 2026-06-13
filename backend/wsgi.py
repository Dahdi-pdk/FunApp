"""
WSGI / ASGI entry point untuk Gunicorn.

Render / Production start command:
    gunicorn -k uvicorn.workers.UvicornWorker -c gunicorn.conf.py wsgi:app

Atau langsung:
    gunicorn -k uvicorn.workers.UvicornWorker wsgi:app --bind 0.0.0.0:$PORT
"""
from server import app  # noqa: F401

# `app` adalah FastAPI ASGI application yang dijalankan oleh
# Uvicorn worker di bawah Gunicorn.
