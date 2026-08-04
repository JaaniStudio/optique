"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Pencil, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
        >
          <Star className={`h-5 w-5 ${n <= display ? "fill-ink text-ink" : "text-ink/25"}`} />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function ProductReviews({ itemId }: { itemId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u as { id: string; email?: string } | null);

    const { data: revs } = await supabase
      .from("reviews").select("*").eq("item_id", itemId).order("created_at", { ascending: false });
    setReviews((revs as Review[]) || []);

    if (u) {
      const { data: mine } = await supabase
        .from("reviews").select("*").eq("item_id", itemId).eq("user_id", u.id).maybeSingle();
      setMyReview((mine as Review) || null);

      const { data: orders } = await supabase
        .from("orders").select("id").eq("user_id", u.id).eq("status", "completed");
      const orderIds = (orders || []).map((o) => o.id);
      let purchased = false;
      if (orderIds.length > 0) {
        const { data: oi } = await supabase
          .from("order_items").select("id").eq("item_id", itemId).in("order_id", orderIds).limit(1);
        purchased = !!oi && oi.length > 0;
      }
      setCanReview(purchased);
    }

    setLoaded(true);
  }

  useEffect(() => { load(); }, [itemId]);

  async function getAuthorName(supabase: ReturnType<typeof createClient>, uid: string, email?: string) {
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", uid).single();
    if (prof?.full_name) return prof.full_name as string;
    return email ? email.split("@")[0] : "Customer";
  }

  async function submit() {
    if (rating < 1) { setError("Please select a rating."); return; }
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { setError("Please log in to review."); setSubmitting(false); return; }

    const authorName = await getAuthorName(supabase, u.id, u.email || undefined);

    if (editing && myReview) {
      const { error: e } = await supabase
        .from("reviews")
        .update({ rating, comment, author_name: authorName, updated_at: new Date().toISOString() })
        .eq("id", myReview.id)
        .eq("user_id", u.id);
      if (e) { setError(e.message); setSubmitting(false); return; }
      const updated = { ...myReview, rating, comment, author_name: authorName };
      setMyReview(updated);
      setReviews((r) => r.map((x) => (x.id === updated.id ? updated : x)));
    } else {
      const { data, error: e } = await supabase
        .from("reviews")
        .insert({ item_id: itemId, user_id: u.id, author_name: authorName, rating, comment })
        .select()
        .single();
      if (e) { setError(e.message); setSubmitting(false); return; }
      setMyReview((data as Review) || null);
      setReviews((r) => [(data as Review), ...r]);
    }

    setEditing(false);
    setRating(0);
    setComment("");
    setSubmitting(false);
  }

  async function removeReview() {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;
    const supabase = createClient();
    const { error: e } = await supabase.from("reviews").delete().eq("id", myReview.id).eq("user_id", myReview.user_id);
    if (e) { setError(e.message); return; }
    setReviews((r) => r.filter((x) => x.id !== myReview?.id));
    setMyReview(null);
    setEditing(false);
    setRating(0);
    setComment("");
  }

  function startEdit() {
    if (!myReview) return;
    setEditing(true);
    setRating(myReview.rating);
    setComment(myReview.comment || "");
    setError("");
  }

  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 pb-16 pt-4">
      <div className="border-t border-ink/10 pt-10">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={Math.round(avg)} />
                <span className="text-sm text-ink/60">{avg.toFixed(1)} &middot; {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Review form / status */}
        {loaded && user && !myReview && (
          <div className="rounded-2xl border border-ink/10 bg-white p-6 mb-8">
            {canReview ? (
              <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <p className="font-semibold mb-3">Write a Review</p>
                <div className="flex items-center gap-3 mb-3">
                  <StarRating value={rating} onChange={setRating} />
                  <span className="text-sm text-ink/50">{rating ? `${rating} star${rating > 1 ? "s" : ""}` : "Click to rate"}</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product (optional)"
                  className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink"
                />
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink/85 disabled:opacity-60"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
                </button>
              </form>
            ) : (
              <p className="flex items-start gap-2 text-sm text-ink/60">
                <MessageSquare className="h-5 w-5 shrink-0 mt-0.5" />
                You can review this item once your order for it is completed.
              </p>
            )}
          </div>
        )}

        {loaded && !user && (
          <div className="rounded-2xl border border-ink/10 bg-white p-6 mb-8 text-sm text-ink/60">
            Log in to write a review for this product.
          </div>
        )}

        {/* My review */}
        {loaded && user && myReview && (
          <div className="rounded-2xl border border-ink/10 bg-ink/5 p-6 mb-8">
            <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
              <div>
                <p className="font-semibold text-sm">{myReview.author_name || "You"}</p>
                <StarRating value={myReview.rating} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium hover:bg-ink/5 transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={removeReview} className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
            {myReview.comment && <p className="text-sm text-ink/70 mt-2">{myReview.comment}</p>}
            <p className="text-xs text-ink/40 mt-2">{formatDate(myReview.created_at)}</p>

            {editing && (
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-4 border-t border-ink/10 pt-4">
                <p className="font-semibold text-sm mb-3">Edit your review</p>
                <div className="flex items-center gap-3 mb-3">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Your review (optional)"
                  className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink"
                />
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink/85 disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setRating(0); setComment(""); setError(""); }}
                    className="text-sm text-ink/50 hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* All reviews */}
        {!loaded && <p className="text-sm text-ink/50 py-6">Loading reviews...</p>}
        {loaded && reviews.length === 0 && (
          <p className="text-sm text-ink/50">No reviews yet. Be the first to share your experience.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="py-5 border-b border-ink/10 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream">
                {(r.author_name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{r.author_name || "Customer"}</p>
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-ink/40">{formatDate(r.created_at)}</span>
                </div>
              </div>
            </div>
            {r.comment && <p className="text-sm text-ink/70 mt-3 leading-relaxed">{r.comment}</p>}
            <p className="inline-flex items-center gap-1 text-xs text-green-700 mt-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified Purchase
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
