"use client";
import { learnerData } from "@/constants/landingPage";
import ContainerHeader from "../components/ContainerHeader";
import ContainerWrapper from "../components/ContainerWrapper";
import StepsChart from "../components/StepsChart";
import LandingPageButton from "../components/Button";
import { useQueryState } from "nuqs";

const ForLearner = () => {
    const [, setParamMode] = useQueryState("signup_as");
    const handleSignUp = () => setParamMode("learner");

    return (
        <ContainerWrapper className="bg-white py-10 px-5">
            <ContainerHeader
                title="For Learners"
                subTitle="Explore new horizons in learning and foster growth"
                description="Search for a  champion your learner deserves and connect with volunteer to teach for free"
                titleColor="!text-[#009BCC]"
            />
            <div className="flex flex-col justify-center items-center gap-1 mt-10 lg:mt-0">
                <div className="flex flex-col lg:flex-row gap-1">
                    {learnerData.map((item, index) => (
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
                        title="Enroll as Learner"
                        type="learner"
                        onClick={handleSignUp}
                    />
                </div>
            </div>
        </ContainerWrapper>
    );
};

export default ForLearner;
