"use client";

import { Input } from "@/components/common/Input";
import TagComponent from "@/components/common/Tag";
import BlogCard from "@/components/landingpage/components/BlogCard";
import { blogData } from "@/constants/landingPage";
import { cn } from "@/utils/merge-class";
import { useState } from "react";

const Blogs = () => {
    const [search, setSearch] = useState("");

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const tags = [
        "All",
        "Education",
        "Technology",
        "Health",
        "Science",
        "Art",
        "Sports",
        "Travel",
        "Food",
        "Fashion",
        "Music",
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleTags = (value: string[]) => {
        setSelectedTags(value);
    };

    return (
        <div className="flex flex-col gap-10 py-[4rem] pb-[10rem] w-[80%] mx-auto">
            <div className="flex flex-col gap-4 items-center ">
                <h2 className="text-[2rem] font-medium text-center leading-normal">
                    Explore Our Blog
                </h2>
                <p className="text-xl text-gray-light text-center leading-normal">
                    Dive into inspiring stories, helpful tips, and valuable resources for both
                    learners and volunteers. Stay updated with the latest trends in education and
                    personal growth through our curated blog posts.
                </p>
            </div>
            <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex gap-2 flex-wrap">
                    {tags.map((tag, index) => (
                        <TagComponent
                            key={index}
                            text={tag}
                            className={cn(
                                "!bg-white !text-black border-black  !cursor-pointer",
                                selectedTags.includes(tag) && " !bg-action !text-white"
                            )}
                            onClick={() => handleTags([tag])}
                        />
                    ))}
                </div>
                <div className="w-[30%] -mb-4">
                    <Input
                        placeholder="Search"
                        inputType="search"
                        name="search"
                        value={search}
                        onChange={handleSearch}
                        inputClassName="!rounded-full !bg-white"
                    />
                </div>
            </div>
            <div className="grid 2xl:grid-cols-4 grid-cols-3 justify-center gap-8 w-full place-items-center">
                {blogData.map((item, index) => (
                    <BlogCard key={index} {...item} />
                ))}
            </div>
        </div>
    );
};

export default Blogs;
