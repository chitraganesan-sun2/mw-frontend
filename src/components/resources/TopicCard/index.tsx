type Props = {
    rootClassName?: string;
    index: number;
    item: any;
    onClick: () => void;
};

const gradient =
    "linear-gradient(to right, #d5e2f6, #d4e4f6, #d4e6f6, #d4e7f5, #d5e9f5, #d5ebf5, #d5ecf5, #d5eef4, #d4f0f4, #d4f2f3, #d5f3f2, #d6f5f0)";

const gradientReverse =
    "linear-gradient(to right, #d6f5f0, #d5f3f2, #d4f2f3, #d4f0f4, #d5eef4, #d5ecf5, #d5ebf5, #d5e9f5, #d4e7f5, #d4e6f6, #d4e4f6, #d5e2f6)";

const TopicCard = ({ rootClassName, index, item, onClick }: Props) => {
    return (
        <>
            <button
                type="button"
                onClick={onClick}
                className={`w-full md:w-[200px] cursor-pointer hover:opacity-80 transition-all duration-300 h-[100px] rounded-xl flex items-center justify-center appearance-none border-0 ${rootClassName}`}
                style={{
                    backgroundImage: index % 2 === 0 ? gradient : gradientReverse,
                }}
            >
                <p className=" font-medium ">{item?.category_name}</p>
            </button>
        </>
    );
};

export const TopicCardSkeleton = ({ length = 5 }: { length?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {Array.from({ length }).map((_, index) => (
                <div key={index} className="col-span-1 w-full cursor-pointer hover:opacity-80 transition-all duration-300 h-[100px] rounded-xl flex items-center justify-center">
                    <div className="w-full h-full bg-gray-300 rounded-xl animate-pulse"></div>
                </div>
            ))}
        </div>
    );
};

export default TopicCard;
