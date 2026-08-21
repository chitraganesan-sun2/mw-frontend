import Divider from "@/components/common/Divider";
import Logo from "@/components/common/Logo";
import Avatar from "./Avatar";
import SectionCard from "./SectionCard";
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
import { useRouter } from "next/navigation";
import { clearCookies } from "@/utils/auth";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
    const router = useRouter();
    const role = getCookie("role");
    const isMobileOrTabScreen = InnerWidth() < 1024;

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
        },
        {
            href: "/settings",
            text: "Settings",
            icon: <SettingIcon />,
        },
    ];

    // Combine all links in the desired order
    // For both roles: Instant Sessions, My Schedule, Role-based link, Resources, Community, Messages, Settings
    const linksData = [instantSessionsLink, ...baseLinksData, roleBasedLink, ...remainingLinks];

    const handleSignOut = () => {
        clearCookies();

        if (typeof window !== "undefined") {
            window.location.href = "/";
        } else {
            router.replace("/");
            router.refresh();
        }
    };

    return (
        <div className="bg-white w-full h-full lg:h-screen flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto">
            <div className="w-full">
                {isMobileOrTabScreen ? (
                    <div className="shrink-0 flex items-center justify-between">
                        <Image src="/logo.png" alt="Logo" height={44} width={50} />
                        {onClose && (
                            <span onClick={onClose} className="cursor-pointer">
                                <FeedModalCloseIcon />
                            </span>
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
                    {linksData.map((link) => (
                        <SectionCard key={link.href} {...link} />
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
