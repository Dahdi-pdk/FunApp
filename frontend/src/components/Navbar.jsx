import React, { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { MagnifyingGlass, House, AppWindow, Article, FilmStrip, MusicNote, SignOut } from "@phosphor-icons/react";

const navItems = [
    { to: "/", label: "Home", icon: House, testId: "nav-home" },
    { to: "/apps", label: "Apps", icon: AppWindow, testId: "nav-apps" },
    { to: "/blog", label: "Blog", icon: Article, testId: "nav-blog" },
    { to: "/videos", label: "Video", icon: FilmStrip, testId: "nav-videos" },
    { to: "/music", label: "Music", icon: MusicNote, testId: "nav-music" },
];

// Secret keyword: ketik ini di search bar untuk membuka akses upload zone.
const UPLOAD_SECRET = "buka-upload-zone";

export default function Navbar() {
    const { search, setSearch, isDev, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Watch search for secret keyword
    useEffect(() => {
        if (search.trim().toLowerCase() === UPLOAD_SECRET) {
            setSearch("");
            navigate("/upload");
        }
    }, [search, navigate, setSearch]);

    return (
        <nav className="sticky top-0 z-50 bg-cream border-b-4 border-ink" data-testid="navbar">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-8 py-2 sm:py-4 flex items-center gap-2 sm:gap-4 flex-wrap">
                <Link
                    to="/"
                    data-testid="nav-logo"
                    className="font-display font-black text-lg sm:text-3xl tracking-tight flex items-center gap-1.5 sm:gap-2"
                >
                    <span className="inline-block bg-brand-yellow border-2 sm:border-4 border-ink px-2 sm:px-3 py-0.5 sm:py-1 nb-shadow-sm">
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

                <div className="hidden md:block flex-1 min-w-[200px]" />

                <div className="relative flex items-center bg-white nb-border nb-shadow-sm flex-1 md:flex-none md:w-[280px] min-w-0">
                    <MagnifyingGlass size={18} weight="bold" className="ml-2 sm:ml-3 flex-shrink-0" />
                    <input
                        type="text"
                        data-testid="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari..."
                        className="bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 font-bold w-full min-w-0 focus:outline-none text-sm sm:text-base"
                    />
                </div>

                {isDev && (
                    <button
                        data-testid="nav-logout"
                        onClick={logout}
                        className="bg-brand-lavender nb-border nb-shadow-sm px-2 sm:px-3 py-1.5 sm:py-2 font-black uppercase text-xs tracking-wider nb-hover nb-press flex items-center gap-1.5 flex-shrink-0"
                        title="Logout developer"
                    >
                        <SignOut size={14} weight="bold" />
                        Dev
                    </button>
                )}
            </div>

            {/* Mobile nav */}
            <div className="md:hidden border-t-4 border-ink bg-cream overflow-x-auto">
                <div className="flex gap-1.5 px-3 py-1.5 min-w-max">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                data-testid={`${item.testId}-mobile`}
                                className={`px-2.5 py-1 font-bold uppercase text-[10px] border-2 border-ink flex items-center gap-1 ${active ? "bg-ink text-cream" : "bg-cream"
                                    }`}
                            >
                                <Icon size={12} weight="bold" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
