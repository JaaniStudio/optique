"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  showCategories?: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  activeCategory: string;
  onCategoryChange: (v: string) => void;
  minPrice: string;
  onMinPriceChange: (v: string) => void;
  maxPrice: string;
  onMaxPriceChange: (v: string) => void;
};

export function ProductFilters({
  categories,
  showCategories = true,
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
}: Props) {
  const [priceError, setPriceError] = useState("");

  function handleMinChange(value: string) {
    onMinPriceChange(value);
    setPriceError("");
    if (maxPrice && value && Number(value) > Number(maxPrice)) {
      setPriceError("Min cannot exceed max");
    }
  }

  function handleMaxChange(value: string) {
    onMaxPriceChange(value);
    setPriceError("");
    if (minPrice && value && Number(value) < Number(minPrice)) {
      setPriceError("Max cannot be less than min");
    }
  }

  function clearFilters() {
    onQueryChange("");
    onCategoryChange("");
    onMinPriceChange("");
    onMaxPriceChange("");
    setPriceError("");
  }

  const hasFilters = activeCategory || minPrice || maxPrice || query;

  return (
    <aside className="space-y-6 bg-ink/5 rounded-lg p-5 border border-ink/10">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-cream rounded-md py-2 pl-10 pr-4 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20"
          />
        </div>
      </div>

      {showCategories && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange("")}
              className={`block text-sm w-full text-left px-3 py-1.5 rounded transition-colors ${
                !activeCategory ? "bg-ink text-cream font-medium" : "hover:bg-ink/10 text-ink/80"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.slug)}
                className={`block text-sm w-full text-left px-3 py-1.5 rounded transition-colors ${
                  activeCategory === cat.slug ? "bg-ink text-cream font-medium" : "hover:bg-ink/10 text-ink/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => handleMinChange(e.target.value)}
            className="w-full bg-cream rounded-md py-1.5 px-3 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="w-full bg-cream rounded-md py-1.5 px-3 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink/20"
          />
        </div>
        {priceError && (
          <p className="text-xs text-red-600 mt-1">{priceError}</p>
        )}
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
