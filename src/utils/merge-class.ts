import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Short words that stay lower-case inside a title ("Book a Session"), except as its first word.
const SMALL_WORDS = new Set(["a", "an", "the", "of", "and", "or", "for", "to", "in", "on"]);

export const formatString = (str: string) => {
    return str
        .replace(/-/g, " ")
        .replace(/\b\w+/g, (word, offset: number) =>
            offset > 0 && SMALL_WORDS.has(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
        );
}
