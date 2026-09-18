import {
    CommunityIcon,
    InstantSessionIcon,
    LearnerIcon,
    ResourceIcon,
    VolunteerIcon,
    MessageIcon,
    SettingIcon,
} from "@/assets/icons";
import CommonHeader from "@/components/common/Header";
import { CalenderHeader } from "@/components/schedule";
import { IoIosArrowBack } from "react-icons/io";

export const getHeaderTitle = (pathname: string) => {
    const path = pathname.split("/")?.[2];
    return path;
};

export const getHeaderIcon = (pathname: string) => {
    if (pathname === "backIcon") return <IoIosArrowBack />;
    switch (getHeaderTitle(pathname)) {
        case "learners":
            return <LearnerIcon />;
        case "resources":
            return <ResourceIcon />;
        case "community":
            return <CommunityIcon />;
        case "volunteer":
            return <VolunteerIcon />;
        case "messages":
            return <MessageIcon />;
        case "settings":
            return <SettingIcon />;
        case "instant-sessions":
            return <InstantSessionIcon />;
        default:
            return null;
    }
};

export const renderHeader = (pathname: string) => {
    switch (getHeaderTitle(pathname)) {
        case "schedule":
            return <CalenderHeader />;
        default:
            return <CommonHeader />;
    }
};
