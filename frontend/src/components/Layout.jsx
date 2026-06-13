import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-cream text-ink">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t-4 border-ink bg-ink text-cream py-8 px-6 mt-12">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-display font-black text-2xl">
                        <span className="bg-brand-yellow text-ink px-2 py-1 mr-1">FUN</span>
                        CENTER.
                    </div>
                    <div className="font-bold uppercase text-xs tracking-widest opacity-80">
                        Built with attitude · © {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
        </div>
    );
}
