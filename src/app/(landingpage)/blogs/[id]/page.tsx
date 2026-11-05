import Image from "next/image";
import React from "react";
import DummyImage from "@/assets/images/BackgroundImg.jpeg";
import TagComponent from "@/components/common/Tag";

// Required for static export (Capacitor mobile build)
export function generateStaticParams() {
    return [{ id: '1' }]; // Placeholder - add real blog IDs when available
}

const BlogDetails = () => {
    const blogDetailsData = {
        category: "Marketing",
        title: "Basics of Guitar",
        author: "John Doe",
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        date: "Mar 10. 2024",
    };

    return (
        <div className="w-[80%] mx-auto flex flex-col gap-5 py-[5rem]">
            <div className="relative w-full h-[30rem] mb-5">
                <Image src={DummyImage} alt="blog" fill className="object-cover rounded-3xl" />
            </div>
            <div className="flex justify-between items-center ">
                <TagComponent
                    text={blogDetailsData.category}
                    className="!bg-[#E0E0E0] py-1 !text-sm"
                />
                <div className="flex items-center gap-5">
                    <span className="text-sm font-medium text-gray-light">
                        {blogDetailsData.date}
                    </span>
                    <span className="text-sm font-medium text-gray-light">
                        {blogDetailsData.author}
                    </span>
                </div>
            </div>
            <h2 className="text-[2rem] font-medium leading-normal">{blogDetailsData.title}</h2>
            <p className="text-gray-light leading-normal">{blogDetailsData.description}</p>
        </div>
    );
};

export default BlogDetails;
