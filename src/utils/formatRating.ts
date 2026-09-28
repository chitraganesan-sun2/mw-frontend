// "5 - 1 Reviews" read like a range; render "5.0 (1 review)" instead.
export function formatRatingSummary(rating: number | string, reviews: number | string): string {
    const r = Number(rating);
    const n = Number(reviews) || 0;
    const ratingText = Number.isFinite(r) ? r.toFixed(1) : String(rating);
    return `${ratingText} (${n} ${n === 1 ? "review" : "reviews"})`;
}
