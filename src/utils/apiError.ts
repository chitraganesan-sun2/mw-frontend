// The axios response interceptor (api/api-client.ts) rejects with its own
// `{ message, status, data }` shape, not an AxiosError - so `err.response.data.detail`
// is always undefined and every caller that read it fell back to a generic message,
// hiding the backend's specific reason ("slot already claimed", "overlaps another
// session", ...). Read the server's `detail` from the right place instead.
export function getApiErrorMessage(err: any, fallback = "Something went wrong. Please try again."): string {
    const detail = err?.data?.detail ?? err?.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    // FastAPI 422s send `detail` as a list of { loc, msg } objects - rendering that
    // array directly as a toast message would crash React.
    if (Array.isArray(detail) && detail.length) {
        const msgs = detail.map((d: any) => (typeof d === "string" ? d : d?.msg)).filter(Boolean);
        if (msgs.length) return msgs.join(". ");
    }
    if (err?.status === 429) return "Too many requests. Please wait a moment and try again.";
    return fallback;
}
