export type Category = {
  id: string;
  name: string;
  slug: string;
  bucket_name: string;
};

export type ItemImage = { url: string; path: string };

export type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  category?: Category;
  stock: number;
  on_sale: boolean;
  sale_price: number | null;
  images: ItemImage[];
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  status: "pending" | "completed" | "cancelled";
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  email?: string;
};

export type SiteSettings = {
  id: number;
  banner_enabled: boolean;
  banner_text: string | null;
  banner_bg_color: string;
  banner_text_color: string;
  bank_account_details: string | null;
};
