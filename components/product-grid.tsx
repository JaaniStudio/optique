"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Item, Category } from "@/types";

const PER_PAGE = 9;

type Props = {
  items: Item[];
  categories: Category[];
  showCategories?: boolean;
};

export function ProductGrid({ items, categories, showCategories = true }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (query) {
        const q = query.toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }
      if (activeCategory && item.category?.slug !== activeCategory) return false;
      if (minPrice && item.price < Number(minPrice)) return false;
      if (maxPrice && item.price > Number(maxPrice)) return false;
      return true;
    });
  }, [items, query, activeCategory, minPrice, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function goTo(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-8 items-start">
      <div className="w-full md:w-56 shrink-0 md:sticky md:top-20">
        <ProductFilters
          categories={categories}
          showCategories={showCategories}
          query={query}
          onQueryChange={(v) => { setQuery(v); setPage(1); }}
          activeCategory={activeCategory}
          onCategoryChange={(v) => { setActiveCategory(v); setPage(1); }}
          minPrice={minPrice}
          onMinPriceChange={(v) => { setMinPrice(v); setPage(1); }}
          maxPrice={maxPrice}
          onMaxPriceChange={(v) => { setMaxPrice(v); setPage(1); }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-ink/50">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {paginated.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-ink/50 py-20">No products found.</p>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage <= 1}
            className="p-2 rounded-lg border border-ink/10 hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`min-w-[2.25rem] h-9 rounded-lg text-sm font-medium transition-colors ${
                p === safePage
                  ? "bg-ink text-cream"
                  : "border border-ink/10 hover:bg-ink/5"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage >= totalPages}
            className="p-2 rounded-lg border border-ink/10 hover:bg-ink/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
