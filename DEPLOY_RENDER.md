# Deploy Fun Center ke Render

## Backend (FastAPI)

### Option A — Gunakan render.yaml (Blueprint)
1. Push repo ke GitHub
2. Di Render dashboard → **New → Blueprint** → pilih repo
3. Render akan otomatis baca `render.yaml` dan deploy backend + frontend

### Option B — Manual Web Service
1. Di Render → **New → Web Service** → connect repo
2. Set **Root Directory**: `backend`
3. **Runtime**: Python 3
4. **Build Command**:
   ```
   apt-get update && apt-get install -y ffmpeg || true
   pip install -r requirements.txt
   ```
5. **Start Command**:
   ```
   gunicorn -k uvicorn.workers.UvicornWorker -c gunicorn.conf.py wsgi:app
   ```
6. **Environment Variables** (Environment tab):
   - `MONGO_URL` — URI MongoDB Atlas (gratis di mongodb.com/atlas)
   - `DB_NAME` — `fun_center`
   - `DEV_PASSWORD` — password developer (ganti dari default `dev123`)
   - `CORS_ORIGINS` — `*` atau domain frontend kamu
   - `WEB_CONCURRENCY` — `2`
   - `PYTHON_VERSION` — `3.11.9`

### ⚠️ Persistent Storage
Render free plan **tidak punya persistent disk**. File upload akan hilang saat restart.
Solusi:
- Upgrade ke **Starter ($7/bulan)** untuk persistent disk (sudah diset di `render.yaml`)
- ATAU gunakan link eksternal / embed code di form upload (tidak perlu disk lokal)
- ATAU integrasi object storage (S3, Cloudflare R2) di masa depan

## Frontend (React Static Site)
1. **New → Static Site** → connect repo
2. **Root Directory**: `frontend`
3. **Build Command**: `yarn install && yarn build`
4. **Publish Directory**: `build`
5. **Environment Variables**:
   - `REACT_APP_BACKEND_URL` — URL backend Render (mis. `https://fun-center-backend.onrender.com`)
6. **Rewrite Rule** (untuk React Router): `/*` → `/index.html`

## File yang dibutuhkan (sudah disiapkan)
- `backend/requirements.txt` — Python deps + `gunicorn`
- `backend/wsgi.py` — WSGI entry (`wsgi:app`)
- `backend/gunicorn.conf.py` — Gunicorn config (port, workers, uvicorn worker)
- `backend/Procfile` — Untuk Heroku-compatible PaaS
- `render.yaml` — Blueprint Render (otomatis deploy backend + frontend)

## Testing setelah deploy
```bash
curl https://YOUR-BACKEND.onrender.com/api/
# {"message":"Fun Center API","status":"ok"}
```
