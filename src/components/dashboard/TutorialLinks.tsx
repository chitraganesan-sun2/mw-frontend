"use client";

import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FiVideo, FiFileText, FiBookOpen, FiExternalLink, FiPlayCircle } from "react-icons/fi";
import { safeHref } from "@/utils/safeHref";
import { getCookie } from "@/utils/auth";
import { VIEW_DEMO_LINK, VIEW_DEMO_LINK_FOR_VOLUNTEER } from "@/definitions";

interface TutorialLink {
    link_id: string;
    title: string;
    url: string;
    category: string;
    description?: string;
    created_at?: string;
}

const DEMO_CATEGORIES = ["learner_demo", "volunteer_demo"];

const categoryIcons: Record<string, React.ReactNode> = {
    video: <FiVideo className="text-gray-700" size={18} aria-hidden="true" />,
    doc: <FiFileText className="text-gray-700" size={18} aria-hidden="true" />,
    guide: <FiBookOpen className="text-gray-700" size={18} aria-hidden="true" />,
};

/**
 * Help hub at the top of Resources: the role's product demo (moved here from the schedule
 * header - it is the same admin-managed Tutorial Link the approval emails use, category
 * learner_demo / volunteer_demo, newest first, with the NEXT_PUBLIC_VIEW_DEMO_LINK* env var
 * as a fallback) followed by the tutorials and guides.
 */
const TutorialLinks = () => {
    // Deferred cookie read - see Sidebar/index.tsx for the SSR hydration reason.
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);

    const { data: links = [], isLoading } = useQuery<TutorialLink[]>({
        queryKey: ["tutorial-links"],
        queryFn: async () => {
            const res = await GET_API(endpoints.tutorialLinks.getAll);
            return Array.isArray(res?.data) ? res.data : [];
        },
    });

    const { demoUrl, guides } = useMemo(() => {
        const demoCategory = role === "volunteer" ? "volunteer_demo" : "learner_demo";
        const newestDemo = links
            .filter((l) => l.category === demoCategory)
            .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0];
        const envFallback = role === "volunteer" ? VIEW_DEMO_LINK_FOR_VOLUNTEER : VIEW_DEMO_LINK;
        return {
            demoUrl: safeHref(newestDemo?.url || envFallback),
            guides: links.filter((l) => !DEMO_CATEGORIES.includes(l.category)),
        };
    }, [links, role]);

    if (isLoading) return (
        <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
    );

    if (!demoUrl && guides.length === 0) return null;

    return (
        <section id="help" aria-labelledby="help-heading" className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 id="help-heading" className="text-lg font-semibold mb-3">Help: Tutorials, Guides &amp; Demo</h2>
            <div className="flex flex-col gap-2">
                {demoUrl && (
                    <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-background hover:bg-gray-100 transition-colors group"
                    >
                        <FiPlayCircle className="text-primary flex-shrink-0" size={20} aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">View Demo</p>
                            <p className="text-xs text-gray-600">A quick walkthrough of how MelodyWings works.</p>
                        </div>
                        <FiExternalLink className="text-gray-500 group-hover:text-primary flex-shrink-0" size={14} aria-hidden="true" />
                    </a>
                )}
                {guides.map((link) => (
                    <a
                        key={link.link_id}
                        href={safeHref(link.url) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-gray-100 transition-colors group"
                    >
                        <div className="flex-shrink-0">
                            {categoryIcons[link.category] || categoryIcons.guide}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {link.title}
                            </p>
                            {link.description && (
                                <p className="text-xs text-gray-600 truncate">
                                    {link.description}
                                </p>
                            )}
                        </div>
                        <FiExternalLink
                            className="text-gray-500 group-hover:text-primary flex-shrink-0"
                            size={14}
                            aria-hidden="true"
                        />
                    </a>
                ))}
            </div>
        </section>
    );
};

export default TutorialLinks;
