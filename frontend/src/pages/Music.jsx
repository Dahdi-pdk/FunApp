import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApp, filterByQuery } from "@/context/AppContext";
import { resolveUrl } from "@/lib/api";
import {
    Play, Pause, SkipForward, SkipBack, Shuffle, Repeat,
    DownloadSimple, MusicNote, SpeakerHigh, SpeakerX
} from "@phosphor-icons/react";

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export default function Music() {
    const { music, search } = useApp();
    const filtered = useMemo(
        () => filterByQuery(music, search, ["title", "artist", "description", "genre"]),
        [music, search]
    );

    const [currentIdx, setCurrentIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [autoplay, setAutoplay] = useState(true);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [speedIdx, setSpeedIdx] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const audioRef = useRef(null);

    const current = filtered[currentIdx];

    useEffect(() => {
        setCurrentIdx(0);
        setProgress(0);
    }, [search, music.length]);

    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;
        a.playbackRate = SPEEDS[speedIdx];
        a.volume = muted ? 0 : volume;
        if (playing) {
            a.play().catch(() => setPlaying(false));
        } else {
            a.pause();
        }
    }, [speedIdx, volume, muted, playing, currentIdx]);

    const handleEnded = () => {
        if (repeat) {
            const a = audioRef.current;
            if (a) { a.currentTime = 0; a.play(); }
            return;
        }
        if (!autoplay) { setPlaying(false); return; }
        next();
    };

    const next = () => {
        if (filtered.length === 0) return;
        let idx;
        if (shuffle) idx = Math.floor(Math.random() * filtered.length);
        else idx = (currentIdx + 1) % filtered.length;
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

    const select = (idx) => {
        setCurrentIdx(idx);
        setPlaying(true);
        setProgress(0);
    };

    const togglePlay = () => {
        if (filtered.length === 0) return;
        setPlaying((p) => !p);
    };

    const onSeek = (e) => {
        const a = audioRef.current;
        if (!a || !duration) return;
        const pct = parseFloat(e.target.value);
        a.currentTime = (pct / 100) * duration;
        setProgress(pct);
    };

    const fmtTime = (s) => {
        if (!s || isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    return (
        <div data-testid="music-page" className="max-w-[1400px] mx-auto px-6 sm:px-12 py-10 pb-40">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                <div>
                    <span className="inline-block bg-brand-teal nb-border nb-shadow-sm px-3 py-1 font-black uppercase text-xs tracking-[0.25em] mb-3">
                        Music Lab
                    </span>
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight">Music Library.</h1>
                </div>
                <div className="bg-ink text-cream px-4 py-2 font-black uppercase text-sm">
                    {filtered.length} Lagu
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-surface nb-border nb-shadow-sm p-12 text-center" data-testid="music-empty">
                    <MusicNote size={64} weight="duotone" className="mx-auto mb-4" />
                    <p className="font-display font-black text-2xl">Belum ada musik.</p>
                </div>
            ) : (
                <div className="bg-surface nb-border nb-shadow overflow-hidden">
                    <div className="grid grid-cols-[40px_60px_1fr_120px_60px] gap-3 px-4 py-3 bg-brand-lavender border-b-4 border-ink font-black uppercase text-xs tracking-widest">
                        <div>#</div>
                        <div></div>
                        <div>Judul / Artist</div>
                        <div className="hidden sm:block">Genre</div>
                        <div></div>
                    </div>
                    {filtered.map((m, idx) => {
                        const isActive = idx === currentIdx && playing;
                        return (
                            <div
                                key={m.id}
                                data-testid={`music-row-${m.id}`}
                                onClick={() => select(idx)}
                                className={`grid grid-cols-[40px_60px_1fr_120px_60px] gap-3 px-4 py-3 border-b-2 border-ink/20 cursor-pointer items-center hover:bg-brand-mint ${idx === currentIdx ? "bg-brand-yellow" : ""
                                    }`}
                            >
                                <div className="font-black text-sm">{idx + 1}</div>
                                <div className="w-12 h-12 bg-ink overflow-hidden border-2 border-ink">
                                    {m.thumbnail_url ? (
                                        <img src={resolveUrl(m.thumbnail_url)} alt={m.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-cream">
                                            <MusicNote size={20} weight="duotone" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-display font-black text-base sm:text-lg truncate flex items-center gap-2">
                                        {isActive && <span className="inline-block w-2 h-2 bg-brand-coral animate-pulse" />}
                                        {m.title}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 truncate">{m.artist}</div>
                                </div>
                                <div className="hidden sm:block text-xs font-bold uppercase tracking-widest opacity-70">{m.genre}</div>
                                <div className="text-right">
                                    {m.music_url && !m.is_embed && (
                                        <a
                                            href={resolveUrl(m.music_url)}
                                            download
                                            target={m.is_external ? "_blank" : "_self"}
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            data-testid={`music-download-${m.id}`}
                                            className="inline-flex bg-ink text-cream p-2 nb-border nb-shadow-sm nb-press"
                                            title="Download"
                                        >
                                            <DownloadSimple size={14} weight="bold" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Audio Element + Embed iframe */}
            {current && !current.is_embed && (
                <audio
                    ref={audioRef}
                    src={resolveUrl(current.music_url)}
                    onTimeUpdate={(e) => {
                        const a = e.target;
                        if (a.duration) setProgress((a.currentTime / a.duration) * 100);
                    }}
                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                    onEnded={handleEnded}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    data-testid="music-audio-element"
                />
            )}

            {/* Sticky Player */}
            {current && (
                <div data-testid="music-sticky-player" className="fixed bottom-0 left-0 right-0 bg-brand-coral border-t-4 border-ink shadow-[0_-8px_0_0_rgba(10,10,10,1)] z-40">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3 sm:py-4">
                        {current.is_embed && current.embed_code ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-12 h-12 bg-ink border-2 border-ink overflow-hidden flex-shrink-0">
                                        {current.thumbnail_url ? <img src={resolveUrl(current.thumbnail_url)} alt="" className="w-full h-full object-cover" /> : <MusicNote className="w-full h-full text-cream p-2" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-display font-black text-base truncate">{current.title}</div>
                                        <div className="text-xs font-bold uppercase tracking-widest opacity-70 truncate">{current.artist} · Embed</div>
                                    </div>
                                </div>
                                <div className="hidden md:block flex-1 max-w-md" dangerouslySetInnerHTML={{ __html: current.embed_code }} />
                                <div className="flex items-center gap-2">
                                    <CtrlBtn onClick={prev} testId="music-prev"><SkipBack size={18} weight="fill" /></CtrlBtn>
                                    <CtrlBtn onClick={next} testId="music-next"><SkipForward size={18} weight="fill" /></CtrlBtn>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                                {/* Track info */}
                                <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                                    <div className="w-14 h-14 bg-ink border-4 border-ink overflow-hidden flex-shrink-0">
                                        {current.thumbnail_url ? <img src={resolveUrl(current.thumbnail_url)} alt="" className="w-full h-full object-cover" /> : <MusicNote className="w-full h-full text-cream p-3" />}
                                    </div>
                                    <div className="min-w-0 hidden sm:block max-w-[180px]">
                                        <div className="font-display font-black text-base truncate">{current.title}</div>
                                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 truncate">{current.artist}</div>
                                    </div>
                                </div>

                                {/* Center controls */}
                                <div className="flex-1 min-w-[280px] flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <ToggleBtn active={shuffle} onClick={() => setShuffle(s => !s)} testId="music-shuffle"><Shuffle size={16} weight="bold" /></ToggleBtn>
                                        <CtrlBtn onClick={prev} testId="music-prev"><SkipBack size={18} weight="fill" /></CtrlBtn>
                                        <CtrlBtn onClick={togglePlay} testId="music-play" accent>
                                            {playing ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}
                                        </CtrlBtn>
                                        <CtrlBtn onClick={next} testId="music-next"><SkipForward size={18} weight="fill" /></CtrlBtn>
                                        <ToggleBtn active={repeat} onClick={() => setRepeat(r => !r)} testId="music-repeat"><Repeat size={16} weight="bold" /></ToggleBtn>
                                    </div>
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="font-bold text-xs min-w-[32px]">{fmtTime((progress / 100) * duration)}</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={progress}
                                            onChange={onSeek}
                                            className="nb-range flex-1"
                                            data-testid="music-seek"
                                        />
                                        <span className="font-bold text-xs min-w-[32px] text-right">{fmtTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Right options */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <ToggleBtn active={autoplay} onClick={() => setAutoplay(a => !a)} testId="music-autoplay" title="Autoplay">
                                        <span className="font-black text-[10px]">AUTO</span>
                                    </ToggleBtn>
                                    <button
                                        data-testid="music-speed"
                                        onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
                                        className="bg-cream nb-border nb-shadow-sm px-3 h-10 font-black text-xs nb-press"
                                    >
                                        {SPEEDS[speedIdx]}×
                                    </button>
                                    <ToggleBtn active={muted} onClick={() => setMuted(m => !m)} testId="music-mute">
                                        {muted ? <SpeakerX size={16} weight="bold" /> : <SpeakerHigh size={16} weight="bold" />}
                                    </ToggleBtn>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const CtrlBtn = ({ children, onClick, testId, accent }) => (
    <button
        data-testid={testId}
        onClick={onClick}
        className={`${accent ? "bg-ink text-cream" : "bg-cream"} nb-border nb-shadow-sm w-10 h-10 flex items-center justify-center nb-press`}
    >
        {children}
    </button>
);

const ToggleBtn = ({ children, active, onClick, testId, title }) => (
    <button
        data-testid={testId}
        title={title}
        onClick={onClick}
        className={`${active ? "bg-ink text-cream" : "bg-cream"} nb-border nb-shadow-sm h-10 min-w-10 px-2 flex items-center justify-center nb-press`}
    >
        {children}
    </button>
);
