import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { MagnifyingGlass, House, AppWindow, Article, FilmStrip, MusicNote, UploadSimple, SignOut } from "@phosphor-icons/react";

const navItems = [
    { to: "/", label: "Home", icon: House, testId: "nav-home" },
    { to: "/apps", label: "Apps", icon: AppWindow, testId: "nav-apps" },
    { to: "/blog", label: "Blog", icon: Article, testId: "nav-blog" },
    { to: "/videos", label: "Video", icon: FilmStrip, testId: "nav-videos" },
    { to: "/music", label: "Music", icon: MusicNote, testId: "nav-music" },
];

export default function Navbar() {
    const { search, setSearch, isDev, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 bg-cream border-b-4 border-ink" data-testid="navbar">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 flex items-center gap-4 flex-wrap">
                <Link
                    to="/"
                    data-testid="nav-logo"
                    className="font-display font-black text-2xl sm:text-3xl tracking-tight flex items-center gap-2"
                >
                    <span className="inline-block bg-brand-yellow border-4 border-ink px-3 py-1 nb-shadow-sm">
                        FUN
                    </span>
                    <span>CENTER.</span>
                </Link>

                <div className="hidden md:flex items-center gap-1 ml-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                data-testid={item.testId}
                                className={`px-4 py-2 font-bold uppercase text-sm tracking-wider border-4 border-ink transition-all ${active ? "bg-ink text-cream" : "bg-cream hover:bg-brand-yellow"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon size={18} weight="bold" />
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>

                <div className="flex-1 min-w-[200px]" />

                <div className="relative flex items-center bg-white nb-border nb-shadow-sm w-full md:w-[280px]">
                    <MagnifyingGlass size={20} weight="bold" className="ml-3" />
                    <input
                        type="text"
                        data-testid="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari semuanya..."
                        className="bg-transparent px-3 py-2 font-bold w-full focus:outline-none"
                    />
                </div>

                <button
                    data-testid="nav-upload"
                    onClick={() => navigate("/upload")}
                    className="bg-brand-coral nb-border nb-shadow-sm px-4 py-2 font-black uppercase text-sm tracking-wider nb-hover nb-press flex items-center gap-2"
                >
                    <UploadSimple size={18} weight="bold" />
                    Upload
                </button>

                {isDev && (
                    <button
                        data-testid="nav-logout"
                        onClick={logout}
                        className="bg-brand-lavender nb-border nb-shadow-sm px-3 py-2 font-black uppercase text-xs tracking-wider nb-hover nb-press flex items-center gap-2"
                        title="Logout developer"
                    >
                        <SignOut size={16} weight="bold" />
                        Dev
                    </button>
                )}
            </div>

            {/* Mobile nav */}
            <div className="md:hidden border-t-4 border-ink bg-cream overflow-x-auto">
                <div className="flex gap-2 px-4 py-2 min-w-max">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                data-testid={`${item.testId}-mobile`}
                                className={`px-3 py-1.5 font-bold uppercase text-xs border-4 border-ink flex items-center gap-1.5 ${active ? "bg-ink text-cream" : "bg-cream"
                                    }`}
                            >
                                <Icon size={14} weight="bold" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
