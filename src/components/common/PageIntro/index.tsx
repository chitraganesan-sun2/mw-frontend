import type { ReactNode } from "react";
import { cn } from "@/utils/merge-class";

/**
 * One short line under a page or section heading saying what the user can do there. Use it where
 * the purpose isn't clear from the heading alone - not on every heading.
 */
export default function PageIntro({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={cn("text-sm text-gray-600 leading-snug", className)}>{children}</p>;
}
