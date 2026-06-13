import React from "react";
import { useApp, filterByQuery } from "@/context/AppContext";
import { resolveUrl } from "@/lib/api";
import { DownloadSimple, Package } from "@phosphor-icons/react";

export default function Apps() {
    const { apps, search } = useApp();
    const filtered = filterByQuery(apps, search, ["title", "description", "category"]);

    return (
        <div data-testid="apps-page" className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                <div>
                    <span className="inline-block bg-brand-yellow nb-border nb-shadow-sm px-3 py-1 font-black uppercase text-xs tracking-[0.25em] mb-3">
                        Marketplace
                    </span>
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight">App Store.</h1>
                    <p className="font-medium mt-2 text-lg">Template aplikasi & tools siap pakai.</p>
                </div>
                <div className="bg-ink text-cream px-4 py-2 font-black uppercase text-sm">
                    {filtered.length} Aplikasi
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
                    {filtered.map((a) => (
                        <AppCard key={a.id} app={a} />
                    ))}
                </div>
            )}
        </div>
    );
}

const AppCard = ({ app }) => {
    const thumb = resolveUrl(app.thumbnail_url);
    const download = resolveUrl(app.download_url);

    return (
        <div data-testid={`app-card-${app.id}`} className="bg-surface nb-border nb-shadow flex flex-col nb-hover">
            <div className="aspect-[4/3] bg-brand-mint border-b-4 border-ink overflow-hidden relative">
                {thumb ? (
                    <img src={thumb} alt={app.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={80} weight="duotone" />
                    </div>
                )}
                {app.category && (
                    <span className="absolute top-3 left-3 bg-brand-yellow nb-border px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                        {app.category}
                    </span>
                )}
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display font-black text-2xl mb-1 leading-tight">{app.title}</h3>
                {app.version && (
                    <div className="text-xs font-bold uppercase tracking-widest text-ink/60 mb-2">v{app.version}</div>
                )}
                <p className="text-sm font-medium flex-1 line-clamp-3">{app.description || "Aplikasi keren menunggu kamu."}</p>
                <a
                    href={download}
                    target={app.is_external ? "_blank" : "_self"}
                    rel="noreferrer"
                    data-testid={`app-download-${app.id}`}
                    className="mt-6 bg-ink text-cream nb-border nb-shadow-sm px-4 py-3 font-black uppercase tracking-wider nb-hover nb-press inline-flex items-center justify-center gap-2"
                >
                    <DownloadSimple size={20} weight="bold" />
                    Download
                </a>
            </div>
        </div>
    );
};

const EmptyState = () => (
    <div data-testid="apps-empty" className="bg-surface nb-border nb-shadow-sm p-12 text-center">
        <Package size={64} weight="duotone" className="mx-auto mb-4" />
        <p className="font-display font-black text-2xl">Belum ada aplikasi.</p>
        <p className="font-medium text-ink/70 mt-2">Developer bisa upload via halaman /upload.</p>
    </div>
);
