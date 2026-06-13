import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AppWindow, Article, FilmStrip, MusicNote, ArrowRight, Lightning, Sparkle } from "@phosphor-icons/react";

const tiles = [
    {
        to: "/apps",
        label: "App Store",
        sub: "Template & Tools",
        icon: AppWindow,
        bg: "bg-brand-yellow",
        testId: "tile-apps",
    },
    {
        to: "/blog",
        label: "Blog Hub",
        sub: "Tulisan keren",
        icon: Article,
        bg: "bg-brand-lavender",
        testId: "tile-blog",
    },
    {
        to: "/videos",
        label: "Video Vault",
        sub: "Tonton & download",
        icon: FilmStrip,
        bg: "bg-brand-coral",
        testId: "tile-videos",
    },
    {
        to: "/music",
        label: "Music Lab",
        sub: "Putar & nikmati",
        icon: MusicNote,
        bg: "bg-brand-teal",
        testId: "tile-music",
    },
];

export default function Home() {
    const { apps, blogs, videos, music } = useApp();
    const counts = {
        apps: apps.length,
        blogs: blogs.length,
        videos: videos.length,
        music: music.length,
    };

    return (
        <div data-testid="home-page">
            {/* Hero */}
            <section className="max-w-[1400px] mx-auto px-6 sm:px-12 pt-10 sm:pt-20 pb-12">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7">
                        <span className="inline-block bg-brand-teal nb-border px-3 py-1 nb-shadow-sm font-black uppercase text-xs tracking-[0.25em] mb-6">
                            <Sparkle size={14} weight="fill" className="inline mr-1 -mt-1" />
                            Welcome to the Hub
                        </span>
                        <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[7.5rem] leading-[0.9] tracking-tight">
                            FUN<br />
                            <span className="bg-brand-yellow nb-border px-3 inline-block nb-shadow">CENTER.</span><br />
                            <span className="text-brand-coral [text-shadow:4px_4px_0_#0A0A0A]">UNLEASHED.</span>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg font-medium">
                            Apps, blog, video, dan musik dalam satu hub yang nakal. Semua siap dimainkan, ditonton, dan diunduh.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/apps"
                                data-testid="hero-cta-apps"
                                className="bg-ink text-cream nb-border nb-shadow px-6 py-4 font-black uppercase tracking-widest nb-hover nb-press inline-flex items-center gap-2"
                            >
                                Jelajahi Apps <ArrowRight size={20} weight="bold" />
                            </Link>
                            <Link
                                to="/music"
                                data-testid="hero-cta-music"
                                className="bg-brand-yellow nb-border nb-shadow px-6 py-4 font-black uppercase tracking-widest nb-hover nb-press inline-flex items-center gap-2"
                            >
                                Putar Musik <Lightning size={20} weight="fill" />
                            </Link>
                        </div>
                    </div>
                    <div className="lg:col-span-5 relative">
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-lavender nb-border nb-shadow z-10 flex items-center justify-center font-display font-black text-4xl rotate-[-8deg]">
                                ★
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-teal nb-border nb-shadow flex items-center justify-center font-display font-black text-2xl rotate-[8deg] z-10">
                                100% FUN
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1533157950006-c38844053d55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhc3RlbCUyMHBvcCUyMGFydHxlbnwwfHx8fDE3ODEzNTk0NzN8MA&ixlib=rb-4.1.0&q=85"
                                alt="hero"
                                className="w-full h-[360px] sm:h-[460px] object-cover nb-border nb-shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee */}
            <section className="bg-ink text-cream border-y-4 border-ink py-4 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap font-display font-black text-3xl sm:text-5xl">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-8 px-8">
                            <span>APPS</span><span className="text-brand-yellow">★</span>
                            <span>BLOG</span><span className="text-brand-coral">★</span>
                            <span>VIDEO</span><span className="text-brand-teal">★</span>
                            <span>MUSIC</span><span className="text-brand-lavender">★</span>
                            <span>DOWNLOAD</span><span className="text-brand-yellow">★</span>
                            <span>FUN</span><span className="text-brand-coral">★</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bento */}
            <section className="max-w-[1400px] mx-auto px-6 sm:px-12 py-16">
                <h2 className="font-display font-black text-4xl sm:text-6xl mb-10 tracking-tight">
                    Pilih Lo Mau Yang Mana.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {tiles.map((t) => {
                        const Icon = t.icon;
                        const count = counts[t.to.replace("/", "")] ?? 0;
                        return (
                            <Link
                                key={t.to}
                                to={t.to}
                                data-testid={t.testId}
                                className={`${t.bg} nb-border nb-shadow p-8 nb-hover nb-press group block`}
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <Icon size={64} weight="duotone" />
                                    <span className="bg-ink text-cream px-3 py-1 font-black text-sm">
                                        {count} item
                                    </span>
                                </div>
                                <div className="font-display font-black text-4xl sm:text-5xl mb-2">
                                    {t.label}
                                </div>
                                <div className="font-bold uppercase text-sm tracking-widest">
                                    {t.sub} →
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
