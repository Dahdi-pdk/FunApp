# Fun Center - PRD

## Original Problem Statement
Buatkan aku website "Fun Center" yang berisi appstore, web blog menu, video, music yang bisa didownload. Buat folder khusus untuk aplikasi(berisi template), folder berisi thumbnail dan link blog, folder video dengan thumbnail auto generate, dan folder music. Tambahkan mekanisme opsi autoplay, acak, speed up, play, pause, dll pada musik dan video. Tambahkan fitur pencarian. Semua file akan diupload oleh developer langsung ke server atau melalui page khusus/link yang hanya dapat diakses oleh developer yang memiliki kata sandi.

## User Choices
- Storage: Local server + external links + embed codes for large files
- Auth: Single password (DEV_PASSWORD env var, default `dev123`)
- Video thumbnail: Auto-generated via ffmpeg from first frame
- Design: Free choice (Neo-brutalist via design agent)
- Blog: Thumbnail + external link only

## Architecture
- Backend: FastAPI + MongoDB (motor). All routes `/api` prefix. Files stored in `/app/backend/uploads/{apps,videos,video_thumbs,music,thumbnails}`. Auth via Bearer token (in-memory `ACTIVE_TOKENS` set).
- Frontend: React + React Router + Tailwind + shadcn/ui. Global state via Context. Neo-brutalist design with Clash Display + DM Sans fonts.
- ffmpeg (installed) for video thumbnail extraction at 00:00:01.

## Implemented (2026-02-13)
- **Backend endpoints**: dev login/verify, CRUD on apps/blogs/videos/music, multipart `/api/upload`, file serving, global search.
- **Pages**: Home (hero + marquee + bento), Apps, Blog (editorial), Videos (custom HTML5 player), Music (sticky bottom player), Upload (password gate + 4 tabs).
- **Media controls**: play, pause, prev, next, shuffle, autoplay, repeat (music), speed cycle (0.5/1/1.25/1.5/2x), mute, seek, fullscreen (video).
- **Source types**: Local file upload, external URL, embed code (for video/music).
- **Search**: Navbar global search + per-endpoint `?q=` filtering.
- **Auto-thumbnail**: ffmpeg subprocess on video upload.

## Test Status
- Backend: 16/16 pytest passing
- Frontend: 100% on tested flows

## Backlog (Future)
- P1: MIME validation on uploads per folder type
- P1: Persist dev tokens (Redis/Mongo) so backend restart doesn't logout
- P2: Pagination for large libraries
- P2: User favorites / playlists
- P2: Analytics on downloads
