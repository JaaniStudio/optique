"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import type { Item, Category } from "@/types";

type Props = {
  items: Item[];
  categories: Category[];
};

export function ProductGrid({ items, categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-8">
      <div className="w-full md:w-56 shrink-0">
        <ProductFilters
          categories={categories}
          query={query}
          onQueryChange={setQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-ink/50 py-20">No products found.</p>
        )}
      </div>
    </div>
  );
}
