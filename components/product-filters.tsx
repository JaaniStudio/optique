"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
};

export function ProductFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeCategory) params.set("category", activeCategory);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    router.push(`/products?${params.toString()}`);
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = form.get("q") as string;
    setParam("q", q);
  }

  const hasFilters = activeCategory || minPrice || maxPrice || query;

  return (
    <aside className="space-y-6 bg-ink/5 rounded-lg p-5 border border-ink/10">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search..."
            className="w-full bg-cream rounded-md py-2 pl-10 pr-4 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20"
          />
        </div>
      </form>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setParam("category", "")}
            className={`block text-sm w-full text-left px-3 py-1.5 rounded transition-colors ${
              !activeCategory ? "bg-ink text-cream font-medium" : "hover:bg-ink/10 text-ink/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setParam("category", cat.slug)}
              className={`block text-sm w-full text-left px-3 py-1.5 rounded transition-colors ${
                activeCategory === cat.slug ? "bg-ink text-cream font-medium" : "hover:bg-ink/10 text-ink/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyFilters}
            onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
            className="w-full bg-cream rounded-md py-1.5 px-3 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyFilters}
            onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
            className="w-full bg-cream rounded-md py-1.5 px-3 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20"
          />
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-red-600 hover:underline"
        >
          <X className="h-3 w-3" /> Clear Filters
        </button>
      )}
    </aside>
  );
}
