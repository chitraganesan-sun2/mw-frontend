"use client";
import DetailCard from "./DetailCard";
import BioHeader from "@/components/profile/Bio/BioHeader";
import Divider from "@/components/common/Divider";
import DetailChipCard from "@/components/profile/Bio/DetailChipCard";
import { getCookie } from "@/utils/auth";
import ContactDetails from "./ContactDetails";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import TagComponent from "@/components/common/Tag";

const index = ({ data }: any) => {
    const role = getCookie("role") || "";
    const isLearner = role === "learner";

    const details = [
        { title: isLearner ? "Subjects to learn" : "Subjects I Teach", tags: data?.subjects },
        { title: "Languages I Speak", tags: data?.languages },
        ( isLearner ? {} :  { title: "Skills", tags: data?.skills })
    ];

    const bio = [
        {
            title: "Experience",
            description: data?.experience,
        },
        {
            title: "Education",
            description: data?.education,
        },
    ];

    const contactDetails = [
        { title: "Phone Number", value: data?.phone_number, icon: <FaPhoneAlt size={15} /> },
        { title: "Email", value: data?.email, icon: <MdEmail size={15} /> },
    ]

    return (
        <div className="bg-white rounded-3xl w-full flex flex-col gap-6 py-5 h-[83vh]">
            <BioHeader data={data} />
            <Divider />
            <div className="h-[65vh] overflow-y-auto flex flex-col gap-3">
                <div className="px-5 flex flex-col gap-3">
                    <p className="font-medium text-xl">Bio</p>
                    <p className="text-sm text-gray-light font-normal">
                        {data?.bio_description}
                    </p>
                </div>
                {
                    data?.country &&
                    <div className="px-5 flex items-center justify-between gap-3">
                        <p className="font-medium ">Location</p>
                        <TagComponent text={data?.country || ""} className="text-xs py-1 font-medium px-2" />
                    </div>
                }
                {
                    data?.gender &&
                    <div className={`px-5 flex items-center justify-between`}>
                        <p className="font-medium">Gender</p>
                        <TagComponent
                            text={data?.gender || ""}
                            className="text-xs py-1 font-medium px-2"
                        />
                    </div>
                }
                {details.map((detail) => (
                    <DetailChipCard key={detail.title} tags={detail.tags} title={detail?.title} />
                ))}
                { !isLearner && bio.map((item) => (
                    <DetailCard key={item.title} title={item.title} description={item.description} />
                ))}
                { isLearner && <ContactDetails tags={contactDetails} /> }
            </div>
        </div>
    );
};

export default index;
