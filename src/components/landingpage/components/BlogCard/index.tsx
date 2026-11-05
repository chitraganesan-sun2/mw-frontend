import React from "react";
import Image from "next/image";
import Link from "next/link";
import TagComponent from "@/components/common/Tag";
import { gradientTextStyle, gradientInnerTextStyle } from "@/constants/landingPage";
import { useRouter } from "next/navigation";

interface BlogCardProps {
    image: any;
    category: string;
    title: string;
    description: string;
    date: string;
    href: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ image, category, title, description, date, href }) => {
    return (
        <div className="flex flex-col gap-4 rounded-xl w-full shadow-md">
            <div className="relative w-full h-[190px] rounded-xl">
                <Image src={image} alt={title} fill className="object-cover rounded-xl" />
            </div>
            <div className="flex flex-col gap-3 px-4 pb-4">
                <TagComponent text={category} className="!bg-[#E0E0E0] py-1 !text-sm" />
                <h2 className="text-xl font-medium ">{title}</h2>
                <p className="text-sm text-gray-light">{description}</p>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-light">{date}</span>
                    <Link style={gradientTextStyle} href={href} className="text-sm underline">
                        Read More
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
