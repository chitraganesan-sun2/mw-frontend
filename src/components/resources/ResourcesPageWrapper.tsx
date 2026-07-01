"use client";

import { getMyResources, getResources } from "@/api/resources";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useWindowSize } from "@/hooks/useWindowSize";

import { useComponentStore } from "@/store/useComponenetStore";
import { getHeaderIcon } from "@/layouts/helper";

import AddResourceCard from "@/components/resources/AddResourceCard";
import Card, { CardSkeleton } from "@/components/resources/Card";
import DetailModal from "@/components/resources/DetailModal";
import { ResourceModal } from "@/components/resources/Modals";
import ResourceReportModal from "@/components/resources/ReportsModal";
import SectionWrapper from "@/components/resources/SectionWrapper";
import TopicCard, { TopicCardSkeleton } from "@/components/resources/TopicCard";
import CategorySection from "@/components/resources/CategorySection";
import { useDebounce } from "use-debounce";
import TutorialLinks from "@/components/dashboard/TutorialLinks";

interface ResourcesPageWrapperProps {
    variant: 'learner' | 'volunteer';
}

const TabData = [
    { id: "topics", label: "Topics" },
    { id: "suggested", label: "Suggested for you" },
];

export default function ResourcesPageWrapper({ variant }: ResourcesPageWrapperProps) {
    const { setHeaderOptions } = useComponentStore();
    const pathname = usePathname();
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const isTabletScreen = width < 1024;

    const [category, setCategory] = useQueryState("category");
    const [_, setId] = useQueryState("id");
    const [mode, setMode] = useQueryState("mode");
    const [searchQuery, setSearchQuery] = useQueryState("query");

    const [activeTab, setActiveTab] = useState("topics");
    const [resources, setResources] = useState([]);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportModalResourceId, setReportModalResourceId] = useState("");

    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    const { data: MyResources, isLoading: isMyResourcesLoading, refetch } = useQuery({
        queryKey: ["my-resources", debouncedSearchQuery],
        queryFn: async () => {
            const myResources = await getMyResources({ query: debouncedSearchQuery || "" });
            return myResources?.items || [];
        },
        enabled: category === "my-resources",
    });

    const { isFetching } = useQuery({
        queryKey: ["resources", debouncedSearchQuery],
        queryFn: async () => {
            setResources([]);
            const allResources = await getResources({ query: debouncedSearchQuery || "" });
            setResources(allResources?.items || []);
            return allResources;
        },
        enabled: !category,
    });

    const { data: ResourceCategories, isFetching: isFetchingCategories } = useQuery({
        queryKey: ["resource-categories"],
        queryFn: async () => {
            const categories = await GET_API(endpoints.resources.getCategories);
            return categories?.data;
        },
    });

    const handleTopicClick = (title: string) => { setCategory(title); setSearchQuery(null); };
    const handleMyResourcesClick = () => { setCategory("my-resources"); setSearchQuery(null); };
    const handleBackClick = () => { setCategory(null); setSearchQuery(null); };
    const handleAddResourceClick = () => setMode("create");
    const handleCloseModal = () => { setMode(null); setId(null); };
    
    const handleViewOrEditResource = (mode: ShowModalType, id: string) => {
        setMode(mode);
        setId(id);
    };

    const handleUserLikeAction = (resource_id: string, likeStatus: boolean) => {
        setResources((prevResources: any) =>
            prevResources?.map((resource: any) =>
                resource?.resource_id === resource_id
                    ? {
                        ...resource,
                        total_likes: resource?.total_likes + (likeStatus ? 1 : -1),
                    }
                    : resource
            )
        );
    };

    const handleReportClick = (resource_id: string) => {
        setReportModalOpen(true);
        setReportModalResourceId(resource_id);
    };

    const handleCloseReportModal = () => {
        setReportModalOpen(false);
        setReportModalResourceId("");
    };

    const topicSingleTitle = useMemo(
        () => ResourceCategories?.find((topic: any) => topic?.category_id === category)?.category_name,
        [ResourceCategories, category]
    );

    useEffect(() => {
        const headerTitle = topicSingleTitle || "Resources";
        const titleIcon = category !== null ? <IoIosArrowBack className="text-lg" /> : getHeaderIcon(pathname);

        setHeaderOptions({
            searchPlaceholder: "Search resources",
            actionButtonTitle: "My Resources",
            actionButtonOnClick: handleMyResourcesClick,
            actionButtonClassName:
                "!h-full !w-[101px] md:!w-auto !bg-black !text-white !rounded-xl hover:!bg-black hover:!text-white !text-xs !py-3 px-4",
            actionButtonPlacement: "left",
            showButton: category === null,
            showTitleButton: !!category,
            title: headerTitle,
            titleIcon,
            titleIconClick: category !== null ? handleBackClick : undefined,
        });
    }, [category, pathname, setHeaderOptions, ResourceCategories, topicSingleTitle]);

    const activeTabStyle = variant === 'learner'
        ? "bg-[#DFF5FF] text-black border border-[#09BAEE]"
        : "bg-[#FFE9D4] text-black border border-[#FE5B11]";

    return (
        <div className="w-full pt-4 lg:pt-8 flex flex-col gap-2 p-4 animate-fadeIn">
            <ResourceModal
                triggerReload={refetch}
                isOpen={mode !== null && mode !== "view"}
                mode={mode as ShowModalType}
                onClose={handleCloseModal}
            />

            <ResourceReportModal
                resourceId={reportModalResourceId}
                isOpen={reportModalOpen}
                onClose={handleCloseReportModal}
            />

            <DetailModal
                handleUserLikeAction={handleUserLikeAction}
                triggerReload={refetch}
                isOpen={mode === "view"}
                onClose={handleCloseModal}
                handleReportClick={handleReportClick}
            />

            {category && topicSingleTitle && (
                <CategorySection
                    topicSingleTitle={topicSingleTitle}
                    handleViewOrEditResource={handleViewOrEditResource}
                />
            )}

            {isTabletScreen && !category && (
                <div className="overflow-x-auto flex gap-2 pb-4 hide-scrollbar md:hidden">
                    {TabData.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm ${activeTab === tab.id
                                    ? activeTabStyle
                                    : "bg-[#F4F7FB] border border-[#E0E0E0] text-[14px] font-[500] text-black"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tutorial Links — shown at top of Resources page */}
            {!category && <TutorialLinks />}

            {/* Topics Section */}
            {isMobile && activeTab === "topics" && (category !== "my-resources") && (ResourceCategories?.length === 0 && !isFetchingCategories) ? (
                <div className="h-full w-full flex-center min-h-[60vh]">No Topics Found</div>
            ) : (isMobile && activeTab === "topics" && isFetchingCategories && !category) ? (
                <div className="h-full w-full flex-center">
                    <TopicCardSkeleton length={5} />
                </div>
            ) : (
                ResourceCategories?.length > 0 &&
                (!isMobile || (isMobile && activeTab === "topics")) &&
                !category && (
                    <SectionWrapper
                        hideSectionHeader={category !== null}
                        data={ResourceCategories}
                        title={!isMobile ? "Topics" : undefined}
                        renderItem={(item, index) => (
                            <TopicCard
                                onClick={() => handleTopicClick(item?.category_id)}
                                index={index}
                                item={item}
                            />
                        )}
                    />
                )
            )}

            {/* Resources Section */}
            {(!isMobile || (isMobile && activeTab === "suggested")) && !category && (
                <SectionWrapper
                    placeHolderComponent={undefined}
                    onPlaceHolderClick={handleAddResourceClick}
                    data={resources || []}
                    isLoading={isFetching}
                    title={!isMobile && category === null ? "Resources" : undefined}
                    renderItem={(item, index) => (
                        <div className="w-full md:w-[250px]">
                            <Card
                                className="max-md:!w-full"
                                imgClassName=""
                                key={item?.resource_id || index}
                                resource={item}
                                onClick={() => handleViewOrEditResource("view", item?.resource_id)}
                                handleReportClick={handleReportClick}
                            />
                        </div>
                    )}
                />
            )}

            {category === "my-resources" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-6">
                    <div className="w-full col-span-1">
                        <AddResourceCard handleClick={handleAddResourceClick} />
                    </div>
                    
                    {isMyResourcesLoading ? (
                        <>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <CardSkeleton key={index} />
                            ))}
                        </>
                    ) : (MyResources?.length === 0) ? (
                        <div className="max-md:!min-h-[300px] h-full w-full flex-center flex-col gap-1">
                            <p>No Resources Found</p>
                            {
                                searchQuery ? (
                                    <button className="text-blue-500 underline" onClick={() => setSearchQuery(null)}>Clear Search</button>
                                ) : (
                                    <button className="text-blue-500 underline" onClick={handleAddResourceClick}>Add Resource</button>
                                )
                            }
                        </div>
                    ) : (
                        MyResources?.map((resource: any, index: number) => (
                            <div key={resource?.resource_id || index} className="col-span-1">
                                <Card
                                    resource={resource}
                                    className="!w-full !h-full"
                                    onClick={() =>
                                        handleViewOrEditResource("view", resource?.resource_id)
                                    }
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
} 