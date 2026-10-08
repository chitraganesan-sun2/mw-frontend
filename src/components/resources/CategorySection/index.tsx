import { getResources } from "@/api/resources";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import React from "react";
import Card, { CardSkeleton } from "../Card";
import { useDebounce } from "use-debounce";

type CategorySectionProps = {
    topicSingleTitle: string;
    isFetching?: boolean;
    handleViewOrEditResource: (mode: ShowModalType, resourceId: string) => void;
};

const CategorySection = ({ topicSingleTitle, handleViewOrEditResource }: CategorySectionProps) => {
    const [category, setCategory] = useQueryState("category");
    const [searchQuery, setSearchQuery] = useQueryState("query");

    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    const { data: categories, isFetching } = useQuery({
        queryKey: ["resources-by-category", category, debouncedSearchQuery],
        queryFn: async () => {
            const allResources = await getResources({ query: debouncedSearchQuery || "", category_id: category || "" });
            return allResources?.items || [];
        },
    });

    const handleBackClick = () => {
        setCategory(null);
        setSearchQuery(null);
    };

    return (
        <div className="flex flex-col md:px-5">
            <h2 className="mb-5 lg:mb-8 font-medium text-xl">
                <button onClick={handleBackClick} className="hover:underline">Resources</button> {">"} {topicSingleTitle}
            </h2>
            {isFetching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <CardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <>
                    {categories &&
                        categories?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {categories?.map((resource: any, index: number) => (
                                <div key={resource?.resource_id || index} className="col-span-1">
                                    <Card
                                        resource={resource}
                                        className="!w-full !h-full"
                                        onClick={() =>
                                            handleViewOrEditResource("view", resource?.resource_id)
                                        }
                                    />
                                </div>
                            ))}
                        </div> ) : (
                        <span className="min-w-[250px] min-h-[275px] h-full w-full flex-center">
                            No Resources Found
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

export default CategorySection;
