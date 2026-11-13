"use client";

import { useState } from "react";
import { IoPlay } from "react-icons/io5";
import { driveEmbedUrl } from "@/utils/drivePreview";
import { safeHref } from "@/utils/safeHref";

type Props = {
    /** The Google Drive link stored on the resource. */
    url?: string;
    title: string;
    /** "By Val C. - 16 Nov 2026" style line shown on the poster. */
    subtitle?: string;
};

/**
 * Click-to-play preview of a recorded WingTime. Nothing from Google is loaded until the viewer
 * presses play, so opening a Resource doesn't set Google cookies or pull a video player; the
 * recording itself is also view-only (downloads are switched off on the Drive file).
 */
const RecordingPlayer = ({ url, title, subtitle }: Props) => {
    const [playing, setPlaying] = useState(false);
    const embed = driveEmbedUrl(url);
    const link = safeHref(url);

    if (!embed) {
        // Not a Drive link we can embed: still offer the plain link.
        return link ? (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white no-underline"
            >
                Watch the recording
            </a>
        ) : null;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-[#0F172A] shadow-md">
                {playing ? (
                    <iframe
                        src={embed}
                        title={`Recording: ${title}`}
                        className="absolute inset-0 h-full w-full border-0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        aria-label={`Play recording: ${title}`}
                        className="group absolute inset-0 flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-0 bg-gradient-to-br from-[#1E3A8A] via-[#4C1D95] to-[#BE185D] p-4 text-white"
                    >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.95)] text-[#1E3A8A] shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110">
                            <IoPlay size={30} className="ml-1" />
                        </span>
                        <span className="text-center text-base font-medium leading-snug line-clamp-2">{title}</span>
                        {subtitle && <span className="text-xs text-[rgba(255,255,255,0.8)]">{subtitle}</span>}
                        <span className="text-[0.7rem] text-[rgba(255,255,255,0.7)]">Plays from Google Drive</span>
                    </button>
                )}
            </div>
            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-primary underline"
                >
                    Open in Google Drive
                </a>
            )}
        </div>
    );
};

export default RecordingPlayer;
