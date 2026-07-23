"use client";
import { volunteerData } from "@/constants/landingPage";
import ContainerHeader from "../components/ContainerHeader";
import ContainerWrapper from "../components/ContainerWrapper";
import StepsChart from "../components/StepsChart";
import LandingPageButton from "../components/Button";
import { useQueryState } from "nuqs";

const ForVolunteer = () => {
    const [, setParamMode] = useQueryState("signup_as");
    const handleSignUp = () => setParamMode("volunteer");

    return (
        <ContainerWrapper className="bg-white py-10 px-5">
            <ContainerHeader
                title="For Volunteers"
                subTitle="You’ll find more than a volunteer role—you’ll find a purpose that uplifts"
                description="Have a passion for teach and helping others? Join our community where your efforts can make a world of difference!"
                titleColor="!text-[#FF6C00]"
            />

            <div className="flex flex-col justify-center items-center gap-1 mt-10 lg:mt-0">
                <div className="flex flex-col lg:flex-row gap-1">
                    {volunteerData.map((item, index) => (
                        <StepsChart
                            key={index}
                            title={item.title}
                            icon={item.icon}
                            iconMobile={item.iconMobile}
                            index={index}
                        />
                    ))}
                </div>
                <div className="max-w-[300px]">
                    <LandingPageButton
                        title="Become a Volunteer"
                        type="volunteer"
                        onClick={handleSignUp}
                    />
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default ForVolunteer;
