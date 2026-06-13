import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const FILE_BASE = BACKEND_URL;

export const api = axios.create({ baseURL: API });

export const resolveUrl = (u) => {
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/api/")) return `${FILE_BASE}${u}`;
    return u;
};

export const setDevToken = (token) => {
    if (token) {
        localStorage.setItem("dev_token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        localStorage.removeItem("dev_token");
        delete api.defaults.headers.common["Authorization"];
    }
};

export const getDevToken = () => {
    const t = localStorage.getItem("dev_token");
    if (t) api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    return t;
};

// Init token from storage on app load
getDevToken();
