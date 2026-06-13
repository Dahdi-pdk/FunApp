import React from "react";
import { useApp, filterByQuery } from "@/context/AppContext";
import { resolveUrl } from "@/lib/api";
import { ArrowUpRight, Article } from "@phosphor-icons/react";

export default function Blog() {
    const { blogs, search } = useApp();
    const filtered = filterByQuery(blogs, search, ["title", "description", "author"]);
    const featured = filtered[0];
    const rest = filtered.slice(1);

    return (
        <div data-testid="blog-page" className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                <div>
                    <span className="inline-block bg-brand-lavender nb-border nb-shadow-sm px-3 py-1 font-black uppercase text-xs tracking-[0.25em] mb-3">
                        Reading List
                    </span>
                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight">Blog Hub.</h1>
                    <p className="font-medium mt-2 text-lg">Kumpulan artikel pilihan dari seluruh internet.</p>
                </div>
                <div className="bg-ink text-cream px-4 py-2 font-black uppercase text-sm">
                    {filtered.length} Artikel
                </div>
            </div>

            {filtered.length === 0 ? (
                <Empty />
            ) : (
                <>
                    {featured && <FeaturedCard blog={featured} />}
                    {rest.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                            {rest.map((b) => (
                                <BlogCard key={b.id} blog={b} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const FeaturedCard = ({ blog }) => (
    <a
        href={blog.external_url}
        target="_blank"
        rel="noreferrer"
        data-testid={`blog-featured-${blog.id}`}
        className="bg-surface nb-border nb-shadow-lg p-0 grid md:grid-cols-2 gap-0 nb-hover overflow-hidden block"
    >
        <div className="aspect-[16/10] md:aspect-auto bg-brand-coral overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-ink">
            {blog.thumbnail_url ? (
                <img src={resolveUrl(blog.thumbnail_url)} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Article size={120} weight="duotone" />
                </div>
            )}
        </div>
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <span className="inline-block w-fit bg-brand-yellow nb-border px-2 py-1 font-black uppercase text-xs tracking-widest mb-4">
                Featured
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl leading-tight mb-4">{blog.title}</h2>
            <p className="font-medium text-ink/80 mb-6 line-clamp-3">{blog.description}</p>
            <div className="flex items-center justify-between">
                {blog.author && <div className="text-sm font-bold uppercase tracking-widest">By {blog.author}</div>}
                <ArrowUpRight size={32} weight="bold" />
            </div>
        </div>
    </a>
);

const BlogCard = ({ blog }) => (
    <a
        href={blog.external_url}
        target="_blank"
        rel="noreferrer"
        data-testid={`blog-card-${blog.id}`}
        className="bg-surface nb-border nb-shadow flex flex-col nb-hover overflow-hidden"
    >
        <div className="aspect-video bg-brand-mint overflow-hidden border-b-4 border-ink">
            {blog.thumbnail_url ? (
                <img src={resolveUrl(blog.thumbnail_url)} alt={blog.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Article size={64} weight="duotone" />
                </div>
            )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-display font-black text-xl leading-tight mb-2">{blog.title}</h3>
            <p className="text-sm font-medium line-clamp-2 flex-1">{blog.description}</p>
            <div className="flex items-center justify-between mt-4">
                {blog.author && <span className="text-xs font-bold uppercase tracking-widest">{blog.author}</span>}
                <ArrowUpRight size={24} weight="bold" />
            </div>
        </div>
    </a>
);

const Empty = () => (
    <div data-testid="blog-empty" className="bg-surface nb-border nb-shadow-sm p-12 text-center">
        <Article size={64} weight="duotone" className="mx-auto mb-4" />
        <p className="font-display font-black text-2xl">Belum ada artikel.</p>
    </div>
);
