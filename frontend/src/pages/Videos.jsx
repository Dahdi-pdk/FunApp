import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApp, filterByQuery } from "@/context/AppContext";
import { resolveUrl } from "@/lib/api";
import {
    Play, Pause, SkipForward, SkipBack, Shuffle, ArrowsClockwise,
    DownloadSimple, FilmStrip, SpeakerHigh, SpeakerX, CornersOut
} from "@phosphor-icons/react";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export default function Videos() {
    const { videos, search } = useApp();
    const filtered = useMemo(
        () => filterByQuery(videos, search, ["title", "description", "category"]),
        [videos, search]
    );

    const [currentIdx, setCurrentIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [autoplay, setAutoplay] = useState(true);
    const [shuffle, setShuffle] = useState(false);
    const [speedIdx, setSpeedIdx] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const current = filtered[currentIdx];

    useEffect(() => {
        setCurrentIdx(0);
        setProgress(0);
    }, [search, videos.length]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.playbackRate = SPEEDS[speedIdx];
        v.muted = muted;
        if (playing) {
            v.play().catch(() => setPlaying(false));
        } else {
            v.pause();
        }
    }, [speedIdx, muted, playing, currentIdx]);

    const handleSelect = (idx) => {
        setCurrentIdx(idx);
        setPlaying(true);
        setProgress(0);
        setTimeout(() => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    };

    const handleEnded = () => {
        if (!autoplay) { setPlaying(false); return; }
        next();
    };

    const next = () => {
        if (filtered.length === 0) return;
        let idx;
        if (shuffle) {
            idx = Math.floor(Math.random() * filtered.length);
        } else {
            idx = (currentIdx + 1) % filtered.length;
        }
        setCurrentIdx(idx);
        setPlaying(true);
        setProgress(0);
    };

    const prev = () => {
        if (filtered.length === 0) return;
        const idx = (currentIdx - 1 + filtered.length) % filtered.length;
        setCurrentIdx(idx);
        setPlaying(true);
        setProgress(0);
    };

    const togglePlay = () => setPlaying((p) => !p);

    const onSeek = (e) => {
        const v = videoRef.current;
        if (!v || !duration) return;
        const pct = parseFloat(e.target.value);
        v.currentTime = (pct / 100) * duration;
        setProgress(pct);
    };

    const fmtTime = (s) => {
        if (!s || isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    const toggleFullscreen = () => {
        const el = videoRef.current;
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen?.();
    };

    return (
        <div data-testid="videos-page" className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                <div>
                    <span className="inline-block bg-brand-coral nb-border nb-shadow-sm px-3 py-1 font-black uppercase text-xs tracking-[0.25em] mb-3">
                        Video Vault
                    </span>
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight">Video Library.</h1>
                </div>
                <div className="bg-ink text-cream px-4 py-2 font-black uppercase text-sm">
                    {filtered.length} Video
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-surface nb-border nb-shadow-sm p-12 text-center" data-testid="videos-empty">
                    <FilmStrip size={64} weight="duotone" className="mx-auto mb-4" />
                    <p className="font-display font-black text-2xl">Belum ada video.</p>
                </div>
            ) : (
                <>
                    {/* Player */}
                    <div ref={containerRef} className="bg-surface nb-border nb-shadow-lg mb-10" data-testid="video-player">
                        <div className="aspect-video bg-ink relative overflow-hidden border-b-4 border-ink">
                            {current?.is_embed && current?.embed_code ? (
                                <div
                                    className="w-full h-full"
                                    dangerouslySetInnerHTML={{ __html: current.embed_code }}
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    src={resolveUrl(current?.video_url)}
                                    poster={resolveUrl(current?.thumbnail_url)}
                                    className="w-full h-full object-contain bg-ink"
                                    onTimeUpdate={(e) => {
                                        const v = e.target;
                                        if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                                    }}
                                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                                    onEnded={handleEnded}
                                    onPlay={() => setPlaying(true)}
                                    onPause={() => setPlaying(false)}
                                    data-testid="video-element"
                                />
                            )}
                        </div>
                        <div className="p-6 bg-brand-yellow border-b-4 border-ink">
                            <h2 className="font-display font-black text-2xl sm:text-3xl leading-tight">
                                {current?.title}
                            </h2>
                            {current?.description && (
                                <p className="font-medium mt-1 line-clamp-2">{current.description}</p>
                            )}
                        </div>

                        {/* Controls */}
                        {!current?.is_embed && (
                            <div className="p-4 sm:p-6 bg-brand-coral border-b-4 border-ink">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="font-bold text-xs min-w-[40px]">{fmtTime((progress / 100) * duration)}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={progress}
                                        onChange={onSeek}
                                        className="nb-range flex-1"
                                        data-testid="video-seek"
                                    />
                                    <span className="font-bold text-xs min-w-[40px] text-right">{fmtTime(duration)}</span>
                                </div>
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2">
                                        <CtrlBtn onClick={prev} testId="video-prev" title="Prev"><SkipBack size={20} weight="fill" /></CtrlBtn>
                                        <CtrlBtn onClick={togglePlay} testId="video-play" title={playing ? "Pause" : "Play"} accent>
                                            {playing ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
                                        </CtrlBtn>
                                        <CtrlBtn onClick={next} testId="video-next" title="Next"><SkipForward size={20} weight="fill" /></CtrlBtn>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <ToggleBtn active={shuffle} onClick={() => setShuffle(s => !s)} testId="video-shuffle" title="Shuffle">
                                            <Shuffle size={18} weight="bold" />
                                        </ToggleBtn>
                                        <ToggleBtn active={autoplay} onClick={() => setAutoplay(a => !a)} testId="video-autoplay" title="Autoplay">
                                            <ArrowsClockwise size={18} weight="bold" />
                                        </ToggleBtn>
                                        <button
                                            data-testid="video-speed"
                                            onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
                                            className="bg-cream nb-border nb-shadow-sm px-3 py-2 font-black text-sm nb-press"
                                            title="Speed"
                                        >
                                            {SPEEDS[speedIdx]}×
                                        </button>
                                        <ToggleBtn active={muted} onClick={() => setMuted(m => !m)} testId="video-mute" title="Mute">
                                            {muted ? <SpeakerX size={18} weight="bold" /> : <SpeakerHigh size={18} weight="bold" />}
                                        </ToggleBtn>
                                        <CtrlBtn onClick={toggleFullscreen} testId="video-fullscreen" title="Fullscreen">
                                            <CornersOut size={18} weight="bold" />
                                        </CtrlBtn>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="p-4 bg-cream flex items-center justify-between flex-wrap gap-3">
                            <div className="text-xs font-bold uppercase tracking-widest opacity-70">
                                Now Playing · {currentIdx + 1} / {filtered.length}
                            </div>
                            {current?.video_url && !current?.is_embed && (
                                <a
                                    href={resolveUrl(current.video_url)}
                                    download
                                    target={current.is_external ? "_blank" : "_self"}
                                    rel="noreferrer"
                                    data-testid="video-download"
                                    className="bg-ink text-cream nb-border nb-shadow-sm px-4 py-2 font-black uppercase text-xs tracking-widest nb-press inline-flex items-center gap-2"
                                >
                                    <DownloadSimple size={16} weight="bold" />
                                    Download
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Playlist Grid */}
                    <h3 className="font-display font-black text-2xl sm:text-3xl mb-6">Playlist</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((v, idx) => (
                            <button
                                key={v.id}
                                data-testid={`video-thumb-${v.id}`}
                                onClick={() => handleSelect(idx)}
                                className={`text-left bg-surface nb-border nb-shadow flex flex-col nb-hover overflow-hidden ${idx === currentIdx ? "ring-0 outline outline-4 outline-brand-coral outline-offset-4" : ""
                                    }`}
                            >
                                <div className="aspect-video bg-ink overflow-hidden border-b-4 border-ink relative">
                                    {v.thumbnail_url ? (
                                        <img src={resolveUrl(v.thumbnail_url)} alt={v.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-cream">
                                            <FilmStrip size={48} weight="duotone" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-ink/40 transition-opacity">
                                        <div className="bg-brand-yellow nb-border p-3"><Play size={32} weight="fill" /></div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-display font-black text-lg leading-tight">{v.title}</h4>
                                    {v.category && <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{v.category}</div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

const CtrlBtn = ({ children, onClick, testId, title, accent }) => (
    <button
        data-testid={testId}
        title={title}
        onClick={onClick}
        className={`${accent ? "bg-ink text-cream" : "bg-cream"} nb-border nb-shadow-sm w-12 h-12 flex items-center justify-center nb-press nb-hover`}
    >
        {children}
    </button>
);

const ToggleBtn = ({ children, active, onClick, testId, title }) => (
    <button
        data-testid={testId}
        title={title}
        onClick={onClick}
        className={`${active ? "bg-ink text-cream" : "bg-cream"} nb-border nb-shadow-sm w-10 h-10 flex items-center justify-center nb-press`}
    >
        {children}
    </button>
);
