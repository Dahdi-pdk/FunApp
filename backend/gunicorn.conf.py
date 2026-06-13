"""
Gunicorn configuration for Fun Center backend.
Used by Render / VPS / Docker. Reads PORT and WEB_CONCURRENCY env vars.
"""
import os
import multiprocessing

# ---- Server socket ----
bind = f"0.0.0.0:{os.environ.get('PORT', '8001')}"
backlog = 2048

# ---- Worker processes ----
# Use Uvicorn worker class for async FastAPI
worker_class = "uvicorn.workers.UvicornWorker"
workers = int(os.environ.get("WEB_CONCURRENCY", max(2, multiprocessing.cpu_count() // 2 + 1)))
worker_connections = 1000
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "120"))
graceful_timeout = 30
keepalive = 5

# ---- Logging ----
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# ---- Process naming ----
proc_name = "fun-center-backend"

# ---- Server mechanics ----
preload_app = False  # keep False with motor (async mongo)
