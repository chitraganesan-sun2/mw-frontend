"use client";

import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import { useQuery } from "@tanstack/react-query";
import { FiVideo, FiFileText, FiBookOpen, FiExternalLink } from "react-icons/fi";

interface TutorialLink {
    link_id: string;
    title: string;
    url: string;
    category: string;
    description?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    video: <FiVideo className="text-blue-500" size={18} />,
    doc: <FiFileText className="text-green-500" size={18} />,
    guide: <FiBookOpen className="text-orange-500" size={18} />,
};

const TutorialLinks = () => {
    const { data: links = [], isLoading } = useQuery<TutorialLink[]>({
        queryKey: ["tutorial-links"],
        queryFn: async () => {
            const res = await GET_API((endpoints as any).tutorialLinks.getAll);
            return res?.data || [];
        },
    });

    if (isLoading || links.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Tutorials & Guides</h3>
            <div className="flex flex-col gap-2">
                {links.map((link) => (
                    <a
                        key={link.link_id}
                        href={link.url}
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
                                <p className="text-xs text-gray-500 truncate">
                                    {link.description}
                                </p>
                            )}
                        </div>
                        <FiExternalLink
                            className="text-gray-400 group-hover:text-primary flex-shrink-0"
                            size={14}
                        />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default TutorialLinks;
