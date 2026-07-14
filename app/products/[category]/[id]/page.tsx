import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/product-detail";
import { notFound } from "next/navigation";
import type { Item } from "@/types";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*, category:categories(*)")
    .eq("id", params.id)
    .single();

  if (!item) notFound();

  return <ProductDetail item={item as Item} />;
}
