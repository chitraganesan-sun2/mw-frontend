"use client";

import type { CSSProperties, ReactNode } from "react";
import { ConfigProvider } from "antd";

/**
 * Role-neutral pages (landing, about-us, donate, join-us, privacy, terms) must not pick up a
 * learner-blue / volunteer-orange accent from a leftover `role` cookie. The theme vars are set
 * on <html> from that cookie (ThemeProvider), so anything here using `text-primary`,
 * `border-primary`, `bg-background`, or antd's colorPrimary (focus rings, checkboxes, links)
 * silently turned blue or orange. This scope pins them to neutral black/grey for its subtree.
 * Entity colours (learner / volunteer Tailwind tokens) are fixed hex and are unaffected.
 *
 * Note: CSS vars only cascade to DOM descendants - antd portals (modals, dropdowns) get the
 * neutral colorPrimary from the ConfigProvider, but not the CSS vars.
 */
const NEUTRAL_PRIMARY = "#121212";

const neutralVars = {
    "--primary-color": NEUTRAL_PRIMARY,
    "--primary-edge-color": NEUTRAL_PRIMARY,
    "--background-color": "#F4F7FB",
    "--background-secondary-color": "#E0E0E0",
} as CSSProperties;

const RoleNeutralScope = ({ children, className }: { children: ReactNode; className?: string }) => (
    <ConfigProvider theme={{ token: { colorPrimary: NEUTRAL_PRIMARY, colorLink: NEUTRAL_PRIMARY } }}>
        <div className={className} style={neutralVars}>
            {children}
        </div>
    </ConfigProvider>
);

export default RoleNeutralScope;
