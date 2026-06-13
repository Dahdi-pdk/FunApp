import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api, resolveUrl } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Lock, UploadSimple, Trash, AppWindow, Article, FilmStrip,
    MusicNote, FloppyDisk, CheckCircle
} from "@phosphor-icons/react";

export default function Upload() {
    const { isDev, login, logout, apps, blogs, videos, music, refresh } = useApp();
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(password);
            toast.success("Selamat datang, Developer!");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Password salah");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isDev) {
        return (
            <div data-testid="upload-gate" className="min-h-[80vh] flex items-center justify-center px-6 py-12">
                <form onSubmit={handleLogin} className="bg-surface nb-border nb-shadow-lg p-8 sm:p-12 w-full max-w-md">
                    <div className="w-16 h-16 bg-brand-yellow nb-border nb-shadow-sm flex items-center justify-center mb-6">
                        <Lock size={32} weight="bold" />
                    </div>
                    <h1 className="font-display font-black text-3xl sm:text-4xl mb-2">Developer Only.</h1>
                    <p className="font-medium mb-8 text-ink/70">Masukin password buat akses upload zone.</p>
                    <label className="block font-black uppercase text-xs tracking-widest mb-2">Password</label>
                    <input
                        type="password"
                        data-testid="dev-password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white nb-border px-4 py-4 font-bold mb-6 focus:outline-none focus:bg-brand-mint"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="dev-login-btn"
                        className="w-full bg-ink text-cream nb-border nb-shadow px-6 py-4 font-black uppercase tracking-widest nb-press nb-hover disabled:opacity-50"
                    >
                        {submitting ? "Verifying..." : "Masuk"}
                    </button>
                    <div className="mt-6 text-xs font-bold uppercase tracking-widest opacity-60 text-center">
                        Default: <code className="bg-brand-yellow px-2 py-1">dev123</code>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div data-testid="upload-dashboard" className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                <div>
                    <span className="inline-block bg-brand-teal nb-border nb-shadow-sm px-3 py-1 font-black uppercase text-xs tracking-[0.25em] mb-3">
                        <CheckCircle size={14} weight="fill" className="inline mr-1 -mt-1" />
                        Developer Mode
                    </span>
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight">Upload Zone.</h1>
                </div>
                <button
                    onClick={logout}
                    data-testid="upload-logout"
                    className="bg-brand-coral nb-border nb-shadow-sm px-4 py-2 font-black uppercase tracking-widest nb-press"
                >
                    Logout
                </button>
            </div>

            <Tabs defaultValue="apps" className="w-full">
                <TabsList className="bg-cream nb-border p-0 h-auto flex-wrap mb-8 w-full justify-start gap-0">
                    <NbTab value="apps" testId="tab-apps"><AppWindow size={18} weight="bold" />Apps</NbTab>
                    <NbTab value="blog" testId="tab-blog"><Article size={18} weight="bold" />Blog</NbTab>
                    <NbTab value="video" testId="tab-video"><FilmStrip size={18} weight="bold" />Video</NbTab>
                    <NbTab value="music" testId="tab-music"><MusicNote size={18} weight="bold" />Music</NbTab>
                </TabsList>

                <TabsContent value="apps">
                    <AppForm onSaved={refresh} />
                    <ItemList title="Daftar Aplikasi" items={apps} onDelete={refresh} type="apps" labelKey="title" />
                </TabsContent>
                <TabsContent value="blog">
                    <BlogForm onSaved={refresh} />
                    <ItemList title="Daftar Blog" items={blogs} onDelete={refresh} type="blogs" labelKey="title" />
                </TabsContent>
                <TabsContent value="video">
                    <VideoForm onSaved={refresh} />
                    <ItemList title="Daftar Video" items={videos} onDelete={refresh} type="videos" labelKey="title" />
                </TabsContent>
                <TabsContent value="music">
                    <MusicForm onSaved={refresh} />
                    <ItemList title="Daftar Musik" items={music} onDelete={refresh} type="music" labelKey="title" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

const NbTab = ({ children, value, testId }) => (
    <TabsTrigger
        value={value}
        data-testid={testId}
        className="font-black uppercase text-xs sm:text-sm tracking-widest data-[state=active]:bg-ink data-[state=active]:text-cream bg-cream rounded-none border-r-4 border-ink px-4 py-3 flex items-center gap-2 last:border-r-0"
    >
        {children}
    </TabsTrigger>
);

const FormShell = ({ title, children, onSubmit, submitting, badge }) => (
    <form
        onSubmit={onSubmit}
        className="bg-surface nb-border nb-shadow p-6 sm:p-8 mb-10"
    >
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h3 className="font-display font-black text-2xl sm:text-3xl">{title}</h3>
            <span className="bg-brand-yellow nb-border px-3 py-1 font-black uppercase text-xs tracking-widest">{badge}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">{children}</div>
        <button
            type="submit"
            disabled={submitting}
            data-testid={`${badge.toLowerCase()}-save-btn`}
            className="mt-6 bg-ink text-cream nb-border nb-shadow px-6 py-3 font-black uppercase tracking-widest nb-press nb-hover disabled:opacity-50 inline-flex items-center gap-2"
        >
            <FloppyDisk size={18} weight="bold" />
            {submitting ? "Menyimpan..." : "Simpan"}
        </button>
    </form>
);

const Field = ({ label, children, span2 }) => (
    <div className={span2 ? "sm:col-span-2" : ""}>
        <label className="block font-black uppercase text-xs tracking-widest mb-2">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full bg-white nb-border px-4 py-3 font-bold focus:outline-none focus:bg-brand-mint";

const uploadFile = async (file, folder) => {
    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("file", file);
    const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
};

// ----- App form -----
const AppForm = ({ onSaved }) => {
    const [form, setForm] = useState({ title: "", description: "", category: "", version: "", is_external: false, download_url: "" });
    const [thumbFile, setThumbFile] = useState(null);
    const [appFile, setAppFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let thumbnail_url = "";
            let download_url = form.download_url;
            if (thumbFile) {
                const r = await uploadFile(thumbFile, "thumbnails");
                thumbnail_url = r.url;
            }
            if (!form.is_external && appFile) {
                const r = await uploadFile(appFile, "apps");
                download_url = r.url;
            }
            if (!download_url) {
                toast.error("Wajib isi file aplikasi atau link eksternal.");
                setSubmitting(false);
                return;
            }
            await api.post("/apps", { ...form, thumbnail_url, download_url });
            toast.success("Aplikasi berhasil diupload!");
            setForm({ title: "", description: "", category: "", version: "", is_external: false, download_url: "" });
            setThumbFile(null); setAppFile(null);
            onSaved();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload gagal");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <FormShell title="Tambah Aplikasi" badge="APPS" onSubmit={submit} submitting={submitting}>
            <Field label="Judul *"><input data-testid="app-title" required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Kategori"><input data-testid="app-category" className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="mis. Productivity" /></Field>
            <Field label="Versi"><input data-testid="app-version" className={inputCls} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" /></Field>
            <Field label="Thumbnail (gambar)"><input data-testid="app-thumb" type="file" accept="image/*" className={inputCls} onChange={(e) => setThumbFile(e.target.files?.[0])} /></Field>
            <Field label="Deskripsi" span2><textarea data-testid="app-desc" className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Sumber File" span2>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="app-source-local" checked={!form.is_external} onChange={() => setForm({ ...form, is_external: false })} className="w-4 h-4" />
                        Upload ke Server
                    </label>
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="app-source-external" checked={form.is_external} onChange={() => setForm({ ...form, is_external: true })} className="w-4 h-4" />
                        Link Eksternal
                    </label>
                </div>
                {form.is_external ? (
                    <input data-testid="app-external-url" className={inputCls} value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })} placeholder="https://drive.google.com/..." />
                ) : (
                    <input data-testid="app-file" type="file" className={inputCls} onChange={(e) => setAppFile(e.target.files?.[0])} />
                )}
            </Field>
        </FormShell>
    );
};

// ----- Blog form -----
const BlogForm = ({ onSaved }) => {
    const [form, setForm] = useState({ title: "", description: "", external_url: "", author: "" });
    const [thumbFile, setThumbFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let thumbnail_url = "";
            if (thumbFile) {
                const r = await uploadFile(thumbFile, "thumbnails");
                thumbnail_url = r.url;
            }
            await api.post("/blogs", { ...form, thumbnail_url });
            toast.success("Blog berhasil disimpan!");
            setForm({ title: "", description: "", external_url: "", author: "" });
            setThumbFile(null);
            onSaved();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Simpan gagal");
        } finally { setSubmitting(false); }
    };

    return (
        <FormShell title="Tambah Blog" badge="BLOG" onSubmit={submit} submitting={submitting}>
            <Field label="Judul *"><input data-testid="blog-title" required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Author"><input data-testid="blog-author" className={inputCls} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
            <Field label="Thumbnail"><input data-testid="blog-thumb" type="file" accept="image/*" className={inputCls} onChange={(e) => setThumbFile(e.target.files?.[0])} /></Field>
            <Field label="URL Blog Eksternal *"><input data-testid="blog-url" required type="url" className={inputCls} value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." /></Field>
            <Field label="Deskripsi" span2><textarea data-testid="blog-desc" className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </FormShell>
    );
};

// ----- Video form -----
const VideoForm = ({ onSaved }) => {
    const [form, setForm] = useState({ title: "", description: "", category: "", is_embed: false, is_external: false, embed_code: "", video_url: "" });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let video_url = form.video_url;
            let thumbnail_url = "";
            if (form.is_embed) {
                // Embed code path
                if (!form.embed_code.trim()) { toast.error("Embed code wajib."); setSubmitting(false); return; }
            } else if (form.is_external) {
                if (!form.video_url.trim()) { toast.error("URL eksternal wajib."); setSubmitting(false); return; }
            } else {
                if (!videoFile) { toast.error("File video wajib diupload."); setSubmitting(false); return; }
                const r = await uploadFile(videoFile, "videos");
                video_url = r.url;
                if (r.thumbnail_url) thumbnail_url = r.thumbnail_url;
            }
            if (thumbFile) {
                const r = await uploadFile(thumbFile, "thumbnails");
                thumbnail_url = r.url; // Manual thumbnail overrides
            }
            await api.post("/videos", { ...form, video_url, thumbnail_url });
            toast.success("Video berhasil diupload!");
            setForm({ title: "", description: "", category: "", is_embed: false, is_external: false, embed_code: "", video_url: "" });
            setVideoFile(null); setThumbFile(null);
            onSaved();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload gagal");
        } finally { setSubmitting(false); }
    };

    return (
        <FormShell title="Tambah Video" badge="VIDEO" onSubmit={submit} submitting={submitting}>
            <Field label="Judul *"><input data-testid="video-title" required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Kategori"><input data-testid="video-category" className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Sumber" span2>
                <div className="flex items-center gap-4 flex-wrap mb-3">
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="video-source-local" checked={!form.is_embed && !form.is_external} onChange={() => setForm({ ...form, is_embed: false, is_external: false })} className="w-4 h-4" />
                        Upload File (auto-thumbnail)
                    </label>
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="video-source-external" checked={form.is_external && !form.is_embed} onChange={() => setForm({ ...form, is_embed: false, is_external: true })} className="w-4 h-4" />
                        URL Eksternal
                    </label>
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="video-source-embed" checked={form.is_embed} onChange={() => setForm({ ...form, is_embed: true, is_external: false })} className="w-4 h-4" />
                        Embed Code (YouTube/Vimeo)
                    </label>
                </div>
                {form.is_embed ? (
                    <textarea data-testid="video-embed-code" required className={inputCls} rows={3} value={form.embed_code} onChange={(e) => setForm({ ...form, embed_code: e.target.value })} placeholder='<iframe src="..."></iframe>' />
                ) : form.is_external ? (
                    <input data-testid="video-external-url" type="url" className={inputCls} value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://.../video.mp4" />
                ) : (
                    <input data-testid="video-file" type="file" accept="video/*" className={inputCls} onChange={(e) => setVideoFile(e.target.files?.[0])} />
                )}
            </Field>
            <Field label="Thumbnail (opsional, override auto)"><input data-testid="video-thumb" type="file" accept="image/*" className={inputCls} onChange={(e) => setThumbFile(e.target.files?.[0])} /></Field>
            <Field label="Deskripsi"><textarea data-testid="video-desc" className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </FormShell>
    );
};

// ----- Music form -----
const MusicForm = ({ onSaved }) => {
    const [form, setForm] = useState({ title: "", artist: "", description: "", genre: "", is_embed: false, is_external: false, embed_code: "", music_url: "" });
    const [musicFile, setMusicFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let music_url = form.music_url;
            let thumbnail_url = "";
            if (form.is_embed) {
                if (!form.embed_code.trim()) { toast.error("Embed code wajib."); setSubmitting(false); return; }
            } else if (form.is_external) {
                if (!form.music_url.trim()) { toast.error("URL eksternal wajib."); setSubmitting(false); return; }
            } else {
                if (!musicFile) { toast.error("File musik wajib diupload."); setSubmitting(false); return; }
                const r = await uploadFile(musicFile, "music");
                music_url = r.url;
            }
            if (thumbFile) {
                const r = await uploadFile(thumbFile, "thumbnails");
                thumbnail_url = r.url;
            }
            await api.post("/music", { ...form, music_url, thumbnail_url });
            toast.success("Musik berhasil diupload!");
            setForm({ title: "", artist: "", description: "", genre: "", is_embed: false, is_external: false, embed_code: "", music_url: "" });
            setMusicFile(null); setThumbFile(null);
            onSaved();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload gagal");
        } finally { setSubmitting(false); }
    };

    return (
        <FormShell title="Tambah Musik" badge="MUSIC" onSubmit={submit} submitting={submitting}>
            <Field label="Judul *"><input data-testid="music-title" required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Artist"><input data-testid="music-artist" className={inputCls} value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} /></Field>
            <Field label="Genre"><input data-testid="music-genre" className={inputCls} value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></Field>
            <Field label="Cover/Thumbnail"><input data-testid="music-thumb" type="file" accept="image/*" className={inputCls} onChange={(e) => setThumbFile(e.target.files?.[0])} /></Field>
            <Field label="Sumber" span2>
                <div className="flex items-center gap-4 flex-wrap mb-3">
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="music-source-local" checked={!form.is_embed && !form.is_external} onChange={() => setForm({ ...form, is_embed: false, is_external: false })} className="w-4 h-4" />
                        Upload File
                    </label>
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="music-source-external" checked={form.is_external && !form.is_embed} onChange={() => setForm({ ...form, is_embed: false, is_external: true })} className="w-4 h-4" />
                        URL Eksternal
                    </label>
                    <label className="font-bold flex items-center gap-2 cursor-pointer">
                        <input type="radio" data-testid="music-source-embed" checked={form.is_embed} onChange={() => setForm({ ...form, is_embed: true, is_external: false })} className="w-4 h-4" />
                        Embed Code (Spotify/SoundCloud)
                    </label>
                </div>
                {form.is_embed ? (
                    <textarea data-testid="music-embed-code" required className={inputCls} rows={3} value={form.embed_code} onChange={(e) => setForm({ ...form, embed_code: e.target.value })} placeholder='<iframe src="..."></iframe>' />
                ) : form.is_external ? (
                    <input data-testid="music-external-url" type="url" className={inputCls} value={form.music_url} onChange={(e) => setForm({ ...form, music_url: e.target.value })} placeholder="https://.../song.mp3" />
                ) : (
                    <input data-testid="music-file" type="file" accept="audio/*" className={inputCls} onChange={(e) => setMusicFile(e.target.files?.[0])} />
                )}
            </Field>
            <Field label="Deskripsi" span2><textarea data-testid="music-desc" className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </FormShell>
    );
};

// ----- Item list with delete -----
const ItemList = ({ title, items, onDelete, type, labelKey }) => {
    const handleDelete = async (id) => {
        if (!window.confirm("Yakin mau hapus?")) return;
        try {
            await api.delete(`/${type}/${id}`);
            toast.success("Item dihapus");
            onDelete();
        } catch (err) {
            toast.error("Gagal hapus");
        }
    };
    return (
        <div className="bg-surface nb-border nb-shadow p-6 sm:p-8">
            <h3 className="font-display font-black text-2xl mb-4">{title} ({items.length})</h3>
            {items.length === 0 ? (
                <p className="font-medium opacity-60">Belum ada item.</p>
            ) : (
                <ul className="divide-y-2 divide-ink/20">
                    {items.map((it) => (
                        <li key={it.id} className="py-3 flex items-center justify-between gap-4">
                            <span className="font-bold truncate flex-1">{it[labelKey]}</span>
                            <button
                                data-testid={`delete-${type}-${it.id}`}
                                onClick={() => handleDelete(it.id)}
                                className="bg-brand-coral nb-border nb-shadow-sm px-3 py-2 nb-press"
                                title="Hapus"
                            >
                                <Trash size={16} weight="bold" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
