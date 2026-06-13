import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setDevToken, getDevToken } from "@/lib/api";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [apps, setApps] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [videos, setVideos] = useState([]);
    const [music, setMusic] = useState([]);
    const [search, setSearch] = useState("");
    const [devToken, setDevTokenState] = useState(getDevToken());
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const [a, b, v, m] = await Promise.all([
                api.get("/apps"),
                api.get("/blogs"),
                api.get("/videos"),
                api.get("/music"),
            ]);
            setApps(a.data || []);
            setBlogs(b.data || []);
            setVideos(v.data || []);
            setMusic(m.data || []);
        } catch (e) {
            console.error("fetchAll error", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const login = async (password) => {
        const res = await api.post("/dev/login", { password });
        const token = res.data.token;
        setDevToken(token);
        setDevTokenState(token);
        return token;
    };

    const logout = () => {
        setDevToken(null);
        setDevTokenState(null);
    };

    const isDev = !!devToken;

    return (
        <AppContext.Provider
            value={{
                apps, blogs, videos, music,
                search, setSearch,
                isDev, login, logout,
                refresh: fetchAll,
                loading,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
};

// Utility filter
export const filterByQuery = (items, q, keys) => {
    if (!q) return items;
    const lc = q.toLowerCase();
    return items.filter((it) =>
        keys.some((k) => (it[k] || "").toString().toLowerCase().includes(lc))
    );
};
