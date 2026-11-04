import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import LivePosts from "./LivePosts";

const communityHighlights = [
    "Access to a rich library of teaching materials and guides",
    "Join a supportive community of fellow volunteers and learners",
];

const Community = () => {
    return (
        <ContainerWrapper>
            <ContainerHeader
                title="Our Community Hub"
                description="At MelodyWings, we believe in empowering both our volunteers and learners beyond just the sessions."
            />
            <div className="mt-10 lg:mt-0 bg-white lg:bg-[#f4f7fb] shadow-inner rounded-3xl p-6 lg:py-10 w-full">
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 place-items-center max-w-[900px] mx-auto">
                    {communityHighlights.map((title) => (
                        <li key={title} className="text-base lg:text-xl font-normal text-center">
                            {title}
                        </li>
                    ))}
                </ul>
                <LivePosts />
            </div>
        </ContainerWrapper>
    );
};

export default Community;
