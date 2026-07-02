/**
 * Profile loading skeleton - shows placeholder blocks while profile data loads.
 * Provides better perceived performance vs a spinner.
 */
const ProfileSkeleton = () => {
    return (
        <div className="bg-white rounded-3xl w-full flex flex-col gap-6 py-5 h-[83vh] animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center gap-3 px-5">
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-40" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-28" />
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 px-4">
                <div className="h-8 bg-gray-200 rounded-full w-28" />
                <div className="h-8 bg-gray-200 rounded-full w-28" />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-5" />

            {/* Content skeleton */}
            <div className="px-5 flex flex-col gap-4">
                <div className="h-5 bg-gray-200 rounded w-36" />
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="h-3 bg-gray-200 rounded w-20" />
                            <div className="h-4 bg-gray-200 rounded w-32" />
                        </div>
                    ))}
                </div>
                {/* Bio section */}
                <div className="col-span-2 flex flex-col gap-1 mt-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
