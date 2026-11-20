// The axios response interceptor (api/api-client.ts) rejects with its own
// `{ message, status, data }` shape, not an AxiosError - so `err.response.data.detail`
// is always undefined and every caller that read it fell back to a generic message,
// hiding the backend's specific reason ("slot already claimed", "overlaps another
// session", ...). Read the server's `detail` from the right place instead.
// Pydantic's length messages are developer-facing ("String should have at most 5000 characters").
// Say the same thing in plain words.
export function friendlyValidationMessage(msg: string): string {
    const most = msg.match(/String should have at most (\d[\d,]*) characters?/i);
    if (most) return `That's too long. Please keep it to ${most[1]} characters or fewer.`;
    const least = msg.match(/String should have at least (\d[\d,]*) characters?/i);
    if (least) return `That's too short. Please use at least ${least[1]} characters.`;
    return msg;
}

export function getApiErrorMessage(err: any, fallback = "Something went wrong. Please try again."): string {
    const detail = err?.data?.detail ?? err?.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return friendlyValidationMessage(detail);
    // FastAPI 422s send `detail` as a list of { loc, msg } objects - rendering that
    // array directly as a toast message would crash React.
    if (Array.isArray(detail) && detail.length) {
        const msgs = detail
            .map((d: any) => (typeof d === "string" ? d : d?.msg))
            .filter(Boolean)
            .map((m: string) => friendlyValidationMessage(m.replace(/^Value error, /, "")));
        if (msgs.length) return msgs.join(". ");
    }
    if (err?.status === 429) return "Too many requests. Please wait a moment and try again.";
    return fallback;
}
