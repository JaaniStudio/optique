"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";

type ProofItem = {
  id: string;
  name: string;
  price: number;
  on_sale: boolean;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: { url: string }[] | null;
  category?: { name: string; slug: string } | null;
};

type ProofMessage = {
  id: string;
  customer: string;
  location: string;
  minutesAgo: number;
  item: ProofItem;
};

const CUSTOMER_NAMES = [
  "Ayesha", "Hamza", "Fatima", "Ali", "Zara", "Bilal", "Sana", "Usman",
  "Mahnoor", "Daniyal", "Hira", "Saad", "Noor", "Fahad", "Iqra", "Ahsan",
  "Maria", "Owais", "Rida", "Shahzaib", "Anum", "Talha",
];

const LOCATIONS = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Hyderabad", "Quetta", "Sialkot",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function SocialProofPopup() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [items, setItems] = useState<ProofItem[]>([]);
  const [message, setMessage] = useState<ProofMessage | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    let active = true;
    const supabase = createClient();

    supabase
      .from("items")
      .select("id, name, price, on_sale, sale_price, thumbnail_url, images, category:categories(name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (active && data) setItems(data as unknown as ProofItem[]);
      });

    return () => { active = false; };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || dismissed || items.length === 0) return;

    let timer: ReturnType<typeof setTimeout>;

    function showNext() {
      setMessage({
        id: `${Date.now()}-${Math.random()}`,
        customer: pick(CUSTOMER_NAMES),
        location: pick(LOCATIONS),
        minutesAgo: Math.floor(Math.random() * 55) + 1,
        item: pick(items),
      });
      timer = setTimeout(showNext, 2000);
    }

    showNext();

    return () => clearTimeout(timer);
  }, [isAdmin, dismissed, items]);

  if (isAdmin || dismissed || !message) return null;

  const price = message.item.on_sale && message.item.sale_price
    ? message.item.sale_price
    : message.item.price;
  const image = message.item.thumbnail_url || message.item.images?.[0]?.url || "/placeholder-glasses.svg";
  const href = `/products/${message.item.category?.slug ?? "all"}/${message.item.id}`;

  return (
    <div className="fixed bottom-20 right-4 z-[90] w-[calc(100%-2rem)] max-w-sm">
      <div className="relative rounded-xl border border-ink/10 bg-white p-3 pr-9 shadow-xl">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-2 top-2 z-10 rounded-full bg-ink/5 p-1.5 text-ink/40 hover:bg-ink/10 hover:text-ink transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <Link href={href} className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
            <Image src={image} alt={message.item.name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-ink/50">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {message.customer} from {message.location}
            </p>
            <p className="truncate text-sm font-medium text-ink">
              just bought {message.item.name}
            </p>
            <p className="text-xs text-ink/50">
              {formatPKR(price)} &middot; {message.minutesAgo} min ago
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
