import React from "react";
import ContainerWrapper from "../components/ContainerWrapper";
import ContainerHeader from "../components/ContainerHeader";
import Image from "next/image";
import CommunityImgOne from "@/assets/images/CommunityImg1.png";
import CommunityImgTwo from "@/assets/images/CommunityImg2.png";

const Community = () => {
    const communityData = [
        {
            title: "Access to a rich library of teaching materials and guides",
            image: CommunityImgOne,
        },
        {
            title: "Join a supportive community of fellow volunteers and learners",
            image: CommunityImgTwo,
        },
    ];

    return (
        <ContainerWrapper>
            <ContainerHeader
                title="Our Community Hub"
                description="At MelodyWings, we believe in empowering both our volunteers and learners beyond just the sessions."
            />
            <div className="mt-10 lg:mt-0 bg-white lg:bg-[#f4f7fb] shadow-inner rounded-3xl p-6 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 place-items-center w-full">
                {communityData.map((item, index) => (
                    <div key={index} className="flex flex-col gap-5 max-w-[420px] w-full">
                        <div className="relative xl:max-w-[420px] w-full h-[190px] lg:h-[256px]">
                            <Image
                                src={item.image}
                                alt="Community"
                                className="object-cover rounded-xl w-full h-full"
                                fill
                            />
                        </div>
                        <p className="text-base lg:text-xl font-normal text-center">{item.title}</p>
                    </div>
                ))}
            </div>
        </ContainerWrapper>
    );
};

export default Community;
