import { Input } from "../Input";
import { useQueryState } from "nuqs";
import Button from "@/components/common/Button";
import { cn, formatString } from "@/utils/merge-class";
import { useComponentStore } from "@/store/useComponenetStore";
import InnerWidth from "@/utils/innerWidth";
import { FeedModalCloseIcon, SideMenuIcon } from "@/assets/icons";
import SideModal from "@/components/common/Modals/MobileSideModal";
import Sidebar from "@/components/common/Sidebar";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { IoIosSearch } from "react-icons/io";
import HeaderNotificationBell from "@/components/common/HeaderNotificationBell";

const CommonHeader: React.FC = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { headerOptions } = useComponentStore();
    const [searchQuery, setSearchQuery] = useQueryState("query");
    const {
        searchPlaceholder,
        actionButtonOnClick,
        actionButtonClassName,
        actionButtonIcon,
        actionButtonPlacement,
        actionButtonTitle,
        actionButtonVariant,
        showTitleButton,
        showButton,
        leftButton,
        titleIcon,
        title,
        titleIconClick,
        actionButtons = [],
        hideSearch,
        centerButton,
        centerComponent,
        hideHeader,
    } = headerOptions || {};

    const isMobileOrTabScreen = InnerWidth() < 1024;
    const isMobile = InnerWidth() < 768;
    const isMessagesChatPage =
        (pathname?.includes("/volunteer/messages") || pathname?.includes("/learner/messages")) &&
        searchParams?.get("chatId");
    const hideHeaderOnMobile = isMobile && isMessagesChatPage;
    const isResourcesPage = pathname?.includes("/resources");
    const isVolunteerLearnersListMobile = isMobile && pathname === "/volunteer/learners";
    const hasMobileStackedSearch =
        isMobile &&
        !hideSearch &&
        (pathname?.includes("/community") || pathname?.includes("/resources"));
    const hasStackedMobileHeader = hasMobileStackedSearch || isVolunteerLearnersListMobile;

    const [isSideNavBarOpen, setIsSideNavBarOpen] = useState<boolean>(false);
    const [isSearchInputOpen, setIsSearchInputOpen] = useState<boolean>(false);

    useEffect(() => {
        setIsSideNavBarOpen(false);
    }, [pathname]);

    const handleSearch = (value: string) => {
        setSearchQuery(value === "" ? null : value);
    };

    const handleMobileSearchClose = () => {
        setSearchQuery(null);
        setIsSearchInputOpen(false);
    };

    if (hideHeader || hideHeaderOnMobile) return null;

    return (
        <div className={cn("w-full h-full relative", hasStackedMobileHeader && "flex flex-col")}>
            <div
                className={cn(
                    "w-full p-2 px-3 flex items-center justify-between relative",
                    hasStackedMobileHeader ? "min-h-[64px] h-auto" : "h-[64px] lg:h-full"
                )}
            >
                <div className="flex items-center gap-5">
                    <div className="flex capitalize items-center">
                        {showTitleButton || (
                            <button
                                type="button"
                                aria-label="Open navigation menu"
                                aria-expanded={isSideNavBarOpen}
                                className="lg:hidden cursor-pointer mr-2 appearance-none border-0 bg-transparent p-0 leading-none"
                                onClick={() => setIsSideNavBarOpen(true)}
                            >
                                <SideMenuIcon height="22px" width="22px" />
                            </button>
                        )}
                        {isMobileOrTabScreen && leftButton?.showButton && !pathname?.includes("/instant-sessions") ? (
                            <Button
                                title={leftButton?.buttonTitle}
                                onClick={leftButton?.buttonOnClick}
                                rootClassName={leftButton?.buttonClassName}
                                size="small"
                                icon={leftButton?.buttonIcon}
                            />
                        ) : (
                            <>
                                {titleIcon &&
                                    (showTitleButton || !isMobileOrTabScreen) &&
                                    (!pathname?.includes("/instant-sessions") || isMobileOrTabScreen) && (
                                        <Button
                                            icon={titleIcon}
                                            rootClassName={cn(
                                                "flex items-center justify-center !w-10 !h-10 rounded-full hover:bg-gray-100",
                                                titleIconClick
                                                    ? "cursor-pointer border-stroke mr-2"
                                                    : "!border-none"
                                            )}
                                            onClick={titleIconClick}
                                        />
                                    )}
                                <h3 className="md:text-lg text-[20px] font-medium">
                                    {formatString(
                                        (!pathname?.includes("/instant-sessions") || isMobileOrTabScreen)
                                            ? (title ?? "")
                                            : ""
                                    )}
                                </h3>
                            </>
                        )}
                    </div>
                    {!isMobileOrTabScreen && leftButton?.showButton && (
                        <Button
                            title={leftButton?.buttonTitle}
                            onClick={leftButton?.buttonOnClick}
                            rootClassName={leftButton?.buttonClassName}
                            size="small"
                            icon={leftButton?.buttonIcon}
                        />
                    )}
                </div>
                {/* Center Content */}
                {(centerButton?.showButton || centerComponent) && !isMobileOrTabScreen && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
                        {centerComponent ? (
                            centerComponent
                        ) : (
                            <Button
                                title={centerButton?.buttonTitle}
                                onClick={centerButton?.buttonOnClick}
                                rootClassName={centerButton?.buttonClassName}
                                size="small"
                                icon={centerButton?.buttonIcon}
                            />
                        )}
                    </div>
                )}
                <div
                    className={cn(
                        actionButtonPlacement === "left" ? "flex-row-reverse" : "flex",
                        "flex items-center justify-center gap-2",
                        pathname?.includes("/community") && "ml-[11px]"
                    )}
                >
                    {isResourcesPage && actionButtonPlacement === "left" && <HeaderNotificationBell />}
                    {showButton && (
                        <Button
                            title={actionButtonTitle}
                            onClick={actionButtonOnClick}
                            rootClassName={actionButtonClassName}
                            size="small"
                            btnVariant={actionButtonVariant || ""}
                            icon={actionButtonIcon}
                        />
                    )}
                    {hideSearch ||
                        (isMobileOrTabScreen &&
                            (leftButton?.showButton ||
                                centerButton?.showButton ||
                                actionButtons?.length > 0)
                            ? null
                            : hasMobileStackedSearch
                              ? null
                              : isMobileOrTabScreen ? ( // Search moved to mobile row below when that row is shown
                                    <Button
                                        icon={<IoIosSearch className="!text-xl" />}
                                        onClick={() => setIsSearchInputOpen(true)}
                                        customClassName="!rounded-full !p-2 !h-fit"
                                        btnVariant="tertiary"
                                    />
                                ) : (
                            <div className={pathname?.includes("/instant-sessions") ? "!pr-5" : ""}>
                                <Input
                                    value={searchQuery ?? ""}
                                    inputType="search"
                                    name="search"
                                    inputClassName="!bg-transparent !rounded-full gap-1 items-center !w-[280px] !h-10 !pr-3"
                                    className="!bg-transparent !w-fit !mb-0"
                                    onChange={handleSearch}
                                    placeholder={searchPlaceholder ?? "Search"}
                                />
                            </div>
                        ))}
                    {!isMobileOrTabScreen &&
                        actionButtons?.map((button: ActionButtons) => (
                            <Button
                                title={button?.buttonTitle}
                                onClick={button?.buttonOnClick}
                                rootClassName={button?.buttonClassName}
                                size="small"
                                icon={button?.buttonIcon}
                            />
                        ))}
                    {(!isResourcesPage || actionButtonPlacement !== "left") && (
                        <HeaderNotificationBell />
                    )}
                </div>
            </div>
            {hasMobileStackedSearch && (
                <div className="w-full px-3 pb-2 pt-1">
                    <Input
                        value={searchQuery ?? ""}
                        inputType="search"
                        name="search"
                        inputClassName="!h-10 !rounded-full !border !border-[#E0E0E0] !bg-transparent hover:!bg-transparent focus:!bg-transparent hover:!border-[#E0E0E0] focus:!border-[#E0E0E0] gap-2 !px-4 !py-2.5"
                        className="!w-full !mb-0 [&_.ant-input-affix-wrapper]:!bg-transparent [&_.ant-input-affix-wrapper]:hover:!bg-transparent [&_.ant-input-affix-wrapper]:focus-within:!bg-transparent [&_.ant-input]:!bg-transparent"
                        onChange={handleSearch}
                        placeholder={searchPlaceholder ?? "Search"}
                    />
                </div>
            )}
            {(leftButton?.showButton || centerButton?.showButton || actionButtons?.length > 0) && (
                <div
                    className={cn(
                        "lg:hidden w-full min-w-0 px-3 pb-2",
                        isVolunteerLearnersListMobile ? "flex flex-col gap-2" : "flex gap-2 items-center"
                    )}
                >
                    {(centerButton?.showButton || centerComponent) && (
                        <div className="flex-1 min-w-0">
                            {centerComponent ? (
                                centerComponent
                            ) : (
                                <Button
                                    title={centerButton?.buttonTitle}
                                    onClick={centerButton?.buttonOnClick}
                                    rootClassName={cn(centerButton?.buttonClassName, "!w-full")}
                                    size="small"
                                    icon={centerButton?.buttonIcon}
                                />
                            )}
                        </div>
                    )}
                    <div
                        className={cn(
                            "flex w-full gap-2",
                            isVolunteerLearnersListMobile ? "items-stretch" : "items-center"
                        )}
                    >
                        {actionButtons?.map((button: ActionButtons, index: number) => (
                            <Button
                                key={`${button?.buttonTitle ?? "action"}-${index}`}
                                title={button?.buttonTitle}
                                onClick={button?.buttonOnClick}
                                rootClassName={cn(
                                    button?.buttonClassName,
                                    isVolunteerLearnersListMobile && "flex-1 min-w-0 !justify-center"
                                )}
                                size="small"
                                icon={button?.buttonIcon}
                            />
                        ))}
                        {!hideSearch && !isVolunteerLearnersListMobile && (
                            <Button
                                icon={<IoIosSearch className="!text-xl" />}
                                onClick={() => setIsSearchInputOpen(true)}
                                customClassName="!rounded-full !p-2 !h-fit"
                                btnVariant="tertiary"
                            />
                        )}
                    </div>
                    {isVolunteerLearnersListMobile && !hideSearch && (
                        <div className="box-border w-full min-w-0 py-2">
                            <Input
                                value={searchQuery ?? ""}
                                inputType="search"
                                name="search"
                                inputClassName="!box-border !h-10 !w-full !min-w-0 !max-w-full !rounded-full !border !border-[#E0E0E0] !bg-white hover:!bg-white focus:!bg-white !px-4 !py-2.5"
                                className="!mb-0 !w-full !min-w-0 !max-w-full [&_.ant-input-affix-wrapper]:!box-border [&_.ant-input-affix-wrapper]:!w-full [&_.ant-input-affix-wrapper]:!max-w-full"
                                onChange={handleSearch}
                                placeholder="Search"
                            />
                        </div>
                    )}
                </div>
            )}
            {isMobileOrTabScreen && (
                <div
                    className={`absolute z-100 w-full h-full bg-white flex-center gap-2 px-5 transform transition-all duration-500 ${isSearchInputOpen ? "top-0 right-0" : "top-0 -right-full"
                        }`}
                >
                    <Input
                        value={searchQuery ?? ""}
                        inputType="search"
                        name="search"
                        inputClassName="bg-background-input rounded-xl gap-1 items-center w-full"
                        className="!w-full !mb-0"
                        onChange={handleSearch}
                        placeholder={searchPlaceholder ?? "Search"}
                    />
                    <button
                        type="button"
                        aria-label="Close search"
                        onClick={handleMobileSearchClose}
                        className="cursor-pointer appearance-none border-0 bg-transparent p-0 leading-none"
                    >
                        <FeedModalCloseIcon width="25" height="25" />
                    </button>
                </div>
            )}
            {isMobileOrTabScreen && (
                <SideModal isOpen={isSideNavBarOpen}>
                    <Sidebar onClose={() => setIsSideNavBarOpen(!isSideNavBarOpen)} />
                </SideModal>
            )}
        </div>
    );
};

export default CommonHeader;
