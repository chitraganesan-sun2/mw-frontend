"use client";
import { CommunityTabs } from "@/constants/community";
import { useQueryState } from "nuqs";

const ActionPanel = () => {
    const [activeTab, setActiveTab] = useQueryState("tab");
    const [searchQuery, setSearchQuery] = useQueryState("query");

    const handleTabClick = (tab: string | null) => {
        setActiveTab(tab);
        setSearchQuery(null);
    };

    // Mobile and Tablet view - Tags
    const MobileTabletView = () => (
        <div className="flex gap-2">
            {CommunityTabs.map((tab) => (
                <button
                    key={tab.route}
                    onClick={() => handleTabClick(tab.route)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out
                        ${
                            activeTab === tab.route
                                ? "bg-background border-primary text-primary border"
                                : "bg-[#f4f7fb] lg:!bg-white text-gray-700 border border-stroke"
                        }`}
                >
                    {tab.name}
                </button>
            ))}
        </div>
    );

    // Desktop view - Full Panel
    const DesktopView = () => (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-5 h-fit sticky top-6">
            <p className="text-xl font-medium">Action Panel</p>
            <div className="flex flex-col gap-3">
                {CommunityTabs.map((tab) => (
                    <button
                        key={tab.route}
                        type="button"
                        className={`flex items-center gap-2 rounded-full px-4 p-3 border-[1px] transition-all cursor-pointer duration-300 ease-in-out hover:bg-background appearance-none text-left ${
                            activeTab === tab.route
                                ? "bg-background border-primary"
                                : "bg-[#f4f7fb] border-stroke"
                        }`}
                        onClick={() => handleTabClick(tab.route)}
                    >
                        <p className="text-sm font-medium">{tab.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div className="block xl:hidden lg:px-3">
                <MobileTabletView />
            </div>
            <div className="hidden xl:block">
                <DesktopView />
            </div>
        </>
    );
};

export default ActionPanel;
