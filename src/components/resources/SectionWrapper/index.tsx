"use client";

import Button from "@/components/common/Button";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useRef } from "react";
import { cn } from "@/utils/merge-class";
import { CardSkeleton } from "../Card";
import { useQueryState } from "nuqs";

const SCROLL_AMOUNT = 300;

type SectionWrapperProps = {
    data: any[];
    title?: string;
    isLoading?: boolean;
    renderItem: (item: any, index: number) => React.ReactNode;
    hideSectionHeader?: boolean;
    placeHolderComponent?: React.ReactNode;
    onPlaceHolderClick?: () => void;
};

const SectionWrapper = ({
    data,
    title,
    renderItem,
    isLoading = false,
    hideSectionHeader = false,
    placeHolderComponent,
    onPlaceHolderClick,
}: SectionWrapperProps) => {
    const [searchQuery, setSearchQuery] = useQueryState("query");

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = SCROLL_AMOUNT; // Adjust scroll amount as needed
            const newScrollPosition =
                scrollContainerRef.current.scrollLeft +
                (direction === "left" ? -scrollAmount : scrollAmount);

            scrollContainerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div hidden={hideSectionHeader} className="w-full h-full md:h-auto">
            {/* Title Section */}
            <div
                className={cn("flex items-center justify-between mb-4 px-4", title ? "" : "hidden")}
            >
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <div className="flex gap-2">
                    <Button
                        icon={<IoIosArrowBack className="text-lg" />}
                        rootClassName="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                        onClick={() => scroll("left")}
                    />
                    <Button
                        icon={<IoIosArrowForward className="text-lg" />}
                        rootClassName="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                        onClick={() => scroll("right")}
                    />
                </div>
            </div>

            {/* Scrollable Content Section */}
            <div
                ref={scrollContainerRef}
                className=" overflow-y-auto h-full md:overflow-x-auto scrollbar-hide flex relative justify-center"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <div className="flex flex-col items-center md:items-start gap-4 md:flex-row px-2 md:gap-4 md:px-4 pb-4 w-full justify-center md:justify-normal">
                    {placeHolderComponent && (
                        <div onClick={onPlaceHolderClick} className="cursor-pointer">
                            {placeHolderComponent}
                        </div>
                    )}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <CardSkeleton key={index} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {data?.length === 0 ? (
                                <span className="min-w-[250px] min-h-[275px] h-full w-full flex-center flex-col gap-1">
                                    <p>No Resources Found</p>
                                    {
                                        searchQuery && (
                                            <Button btnVariant="link" title="Clear Search" onClick={() => setSearchQuery(null)} />
                                        )
                                    }
                                </span>
                            ) : (
                                Array.isArray(data) &&
                                data.map((item, index) => <>{renderItem(item, index)}</>)
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SectionWrapper;
