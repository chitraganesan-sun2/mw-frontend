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
        <div className="w-full bg-background-input px-4 py-6 lg:px-6 lg:py-10">
        <div className="flex flex-col gap-8 lg:gap-10 py-10 px-5 lg:p-10 w-full max-w-[1400px] mx-auto rounded-3xl bg-white">
            <div className="flex flex-col gap-4 items-center ">
                <h1 className="text-2xl lg:text-[2rem] font-medium text-center leading-normal">
                    Explore Our Blog
                </h1>
                <p className="text-sm lg:text-xl text-gray-light text-center leading-normal">
                    Dive into inspiring stories, helpful tips, and valuable resources for both
                    learners and volunteers. Stay updated with the latest trends in education and
                    personal growth through our curated blog posts.
                </p>
            </div>
            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4 w-full">
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
                <div className="w-full md:w-[30%] -mb-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 justify-center gap-6 lg:gap-8 w-full place-items-center">
                {blogData.map((item, index) => (
                    <BlogCard key={index} {...item} />
                ))}
            </div>
        </div>
        </div>
    );
};

export default Blogs;
