import type { Metadata } from "next";

// blogs/page.tsx is "use client", so metadata lives here instead.
//
// noindex is deliberate, not an oversight: the blog currently renders only
// placeholder/duplicate stub posts (see src/constants/landingPage.tsx's blogData -
// identical "The Future of AI" cards with a dummy image, all linking to the same
// /blogs/1). The nav link to this section is also intentionally left commented out
// in Header/index.tsx for the same reason. Remove this override once real posts
// exist and the nav link is re-enabled.
export const metadata: Metadata = {
    title: "Blog",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: undefined,
    },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
