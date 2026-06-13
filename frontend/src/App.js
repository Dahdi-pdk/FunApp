import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Apps from "@/pages/Apps";
import Blog from "@/pages/Blog";
import Videos from "@/pages/Videos";
import Music from "@/pages/Music";
import Upload from "@/pages/Upload";

function App() {
    return (
        <div className="App">
            <AppProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="apps" element={<Apps />} />
                            <Route path="blog" element={<Blog />} />
                            <Route path="videos" element={<Videos />} />
                            <Route path="music" element={<Music />} />
                            <Route path="upload" element={<Upload />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
                <Toaster position="top-right" />
            </AppProvider>
        </div>
    );
}

export default App;
