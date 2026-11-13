/**
 * Turns a Google Drive "view" link into the matching embeddable preview URL, or `undefined`.
 *
 * Only https://drive.google.com/file/d/<id>/... is accepted and the embed URL is rebuilt from the
 * validated id alone, so a stored value can never smuggle another host (or a query string) into an
 * iframe `src`. Keep the host in sync with `frame-src` in next.config.mjs.
 */
const FILE_PATH = /^\/file\/d\/([A-Za-z0-9_-]{10,})(?:\/|$)/;

export function driveEmbedUrl(url: unknown): string | undefined {
    if (typeof url !== "string") return undefined;
    let parsed: URL;
    try {
        parsed = new URL(url.trim());
    } catch {
        return undefined;
    }
    if (parsed.protocol !== "https:" || parsed.hostname !== "drive.google.com") return undefined;
    const match = FILE_PATH.exec(parsed.pathname);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : undefined;
}
