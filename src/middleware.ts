import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isCookiesFound, isTokenValid } from "./utils/auth";
import { LANDING_PAGE_ROUTES, getRedirectForRoute, type OnboardedStatus } from "./utils/routeGuard";

const EXCLUDED_PATHS = ["/favicon.ico", "/logo.png"];

// List of search engine crawler user agents
const SEARCH_ENGINE_BOTS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "exabot",
  "facebot",
  "ia_archiver",
  "facebookexternalhit",
  "twitterbot",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest",
  "developers.google.com/+/web/snippet",
];

// Check if the request is from a search engine crawler
function isSearchEngineBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SEARCH_ENGINE_BOTS.some((bot) => ua.includes(bot));
}

export default function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const userAgent = req.headers.get("user-agent");

  // Allow search engine bots to access public pages
  const isBot = isSearchEngineBot(userAgent);
  const PUBLIC_ROUTES = [...LANDING_PAGE_ROUTES, "/robots.txt", "/sitemap.xml"];

  if (isBot && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (EXCLUDED_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return NextResponse.next();
  }

  const { cookies } = req;
  const isUserCookiesFound = isCookiesFound(cookies);
  const isUserTokenValid = isTokenValid(cookies);
  const role = cookies.get("role")?.value as "learner" | "volunteer" | undefined;
  const onboardedStatus = (cookies.get("onboarded_status")?.value || "") as OnboardedStatus;

  const redirectTo = getRedirectForRoute(pathname, {
    isAuthenticated: isUserCookiesFound && isUserTokenValid,
    role,
    onboardedStatus,
  });

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  return NextResponse.next();
}
