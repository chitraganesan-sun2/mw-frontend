import Divider from "@/components/common/Divider";
import Logo from "@/components/common/Logo";
import Avatar from "./Avatar";
import SectionCard from "./SectionCard";
import { HiOutlineSparkles } from "react-icons/hi2";
import {
    CalendarIcon,
    CommunityIcon,
    FeedModalCloseIcon,
    LearnerIcon,
    ResourceIcon,
    SignOutIcon,
    VolunteerIcon,
    MessageIcon,
    SettingIcon,
    InstantSessionIcon,
} from "@/assets/icons";
import { getCookie } from "@/utils/auth";
import Link from "next/link";
import InnerWidth from "@/utils/innerWidth";
import Image from "next/image";
import { signOut } from "@/utils/signOut";
import { useEffect, useState } from "react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server's nav-item set differ from the client's role,
    // triggering a full hydration-mismatch remount of the whole sidebar on every page.
    const [role, setRole] = useState<string | undefined>(undefined);
    useEffect(() => {
        setRole(getCookie("role"));
    }, []);
    const isMobileOrTabScreen = InnerWidth() < 1024;
    const { unreadMessages } = useUnreadMessages();

    // Instant Sessions - for both learners and volunteers
    const instantSessionsLink = {
        href: "/instant-sessions",
        text: "Instant Sessions",
        icon: <InstantSessionIcon />,
    };

    const baseLinksData = [
        {
            href: "/schedule",
            text: "My Schedule",
            icon: <CalendarIcon />,
        },
    ];

    // Insert either learner or volunteer link at position 2 based on role
    const roleBasedLink =
        role === "volunteer"
            ? {
                  href: "/learners",
                  text: "Learners",
                  icon: <LearnerIcon />,
              }
            : {
                  href: "/volunteer",
                  text: "Seek Volunteer",
                  icon: <VolunteerIcon />,
              };

    // The match dashboard ("Find My Volunteer" / "Find My Learner"). It used to live at the
    // bare /learner and /volunteer paths, which the route guard redirects to the schedule,
    // so it was unreachable from anywhere (incl. the match_found push).
    const matchesLink = {
        href: "/matches",
        text: "My Matches",
        icon: <HiOutlineSparkles />,
    };

    const remainingLinks: any[] = [
        {
            href: "/resources",
            text: "Resources",
            icon: <ResourceIcon />,
        },
        {
            href: "/community",
            text: "Community",
            icon: <CommunityIcon />,
        },
        {
            href: "/messages",
            text: "Messages",
            icon: <MessageIcon />,
            badge: unreadMessages ?? 0,
        },
        {
            href: "/settings",
            text: "Settings",
            icon: <SettingIcon />,
        },
    ];

    // Combine all links in the desired order
    // For both roles: My Schedule (the landing dashboard), Instant Sessions, Role-based link,
    // My Matches, Resources, Community, Messages, Settings
    const linksData = [...baseLinksData, instantSessionsLink, roleBasedLink, matchesLink, ...remainingLinks];

    const handleSignOut = () => signOut();

    return (
        <div className="bg-white w-full h-full lg:h-screen flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto">
            <div className="w-full">
                {isMobileOrTabScreen ? (
                    <div className="shrink-0 flex items-center justify-between">
                        <Image src="/logo.png" alt="Logo" height={44} width={50} />
                        {onClose && (
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={onClose}
                                className="cursor-pointer appearance-none border-0 bg-transparent p-0 leading-none"
                            >
                                <FeedModalCloseIcon />
                            </button>
                        )}
                    </div>
                ) : (
                    <Link href="/">
                        <Logo />
                    </Link>
                )}
                <div className="flex flex-col items-center gap-3 w-full  md:mt-[4rem]">
                    <Avatar />
                    <Divider className="max-md:!w-full" />
                </div>
                <div className="flex flex-col items-center gap-6 md:gap-5 lg:gap-[2.2rem] w-full mt-[1rem] md:mt-[2rem]">
                    {/* Every link is role-prefixed - until the role cookie has been read
                        (after mount) render placeholders instead of hrefs like "/schedule"
                        that 404 if clicked. */}
                    {role
                        ? linksData.map((link) => <SectionCard key={link.href} role={role} {...link} />)
                        : linksData.map((link) => (
                              <div
                                  key={link.href}
                                  aria-hidden="true"
                                  className="h-6 w-full lg:max-w-[150px] rounded bg-gray-100 animate-pulse"
                              />
                          ))}
                </div>
            </div>
            <div className="w-full flex flex-col gap-3 mt-4">
                <button onClick={handleSignOut} className="flex gap-1 mt-2">
                    <span className={`text-[1.25rem] transition-all duration-300 "text-black"`}>
                        <SignOutIcon />
                    </span>
                    <p
                        style={{ color: "#B91C1C" }}
                        className={`!text-[#B91C1C] transition-all duration-300 font-medium`}
                    >
                        Sign Out
                    </p>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
