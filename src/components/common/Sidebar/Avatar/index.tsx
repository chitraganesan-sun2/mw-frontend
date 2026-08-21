"use client";
import { endpoints } from "@/api/constants";
import { GET_API } from "@/api/request";
import TagComponent from "@/components/common/Tag";
import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import Image from "next/image";
import Link from "next/link";

const Avatar = () => {
    const role = getCookie("role");
    const volunteerId = getCookie("volunteer_id");
    const learnerId = getCookie("learner_id");
    const isVolunteer = role === "volunteer";

    const {
        userName,
        userImage,
        setUserName,
        setUserImage,
        setLearnerName,
        setVolunteerName,
        setVolunteerDetails,
        setLearnerDetails,
    } = useAppStore();

    const getUserDetails = async () => {
        const endpoint = isVolunteer
            ? endpoints.volunteer.getIndividualVolunteer(volunteerId as string)
            : endpoints.learner.getIndividualLearner(learnerId as string);
        const { status, data } = await GET_API(endpoint);

        if (status !== 200 || !data) return null;
        if (role === "learner") {
            setLearnerDetails(data);
            const learnerName =
                data?.learner_personal_info?.learner_first_name +
                " " +
                data?.learner_personal_info?.learner_last_name;
            setLearnerName(learnerName);
            setUserName(learnerName);
            setUserImage(data?.profile_picture?.image_url);
        } else {
            setVolunteerDetails(data);
            const volunteerName = data?.volunteer_first_name + " " + data?.volunteer_last_name;
            setUserName(volunteerName);
            setVolunteerName(volunteerName);
            setUserImage(data?.profile_picture?.image_url);
        }

        return data;
    };

    const queryKey = isVolunteer
        ? ["volunteerDetails", volunteerId]
        : ["learnerDetails", learnerId];
    const { data } = useQuery({
        queryKey: queryKey,
        queryFn: async () => await getUserDetails(),
    });

    return (
        <Link href={`/${role}/profile`} className="flex flex-col items-center gap-2 p-2">
            <div className="relative w-[80px] h-[80px]">
                <Image src={userImage} alt="avatar" fill className="object-cover rounded-full" />
            </div>
            <p className="font-medium text-center">{userName}</p>
            <TagComponent text={role || ""} />
            <p className="text-xs text-gray-light  text-center">
                {isVolunteer
                    ? data?.volunteer_contact_details?.timezone
                    : data?.learner_personal_info?.learner_contact_details?.timezone}
            </p>
        </Link>
    );
};

export default Avatar;
