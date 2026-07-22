import React, { useState } from "react";
import Modal from "antd/es/modal";
import ModalCloseIcon from "@/assets/icons/FeedModalCloseIcon";
import { Radio } from "antd";
import Button from "@/components/common/Button";
import { useQueryState } from "nuqs";
import { Input } from "@/components/common/Input";
import { FcGoogle } from "react-icons/fc";
import { apiGoogleSignUp } from "@/api/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/common/Toast";
import ModalLoader from "@/components/common/Loader/Modal";
import { getCookie } from "@/utils/auth";
import { handleCookie } from "@/api/auth";
import dayjs from "dayjs";
import { isNativePlatform } from "@/utils/platform";
import { nativeGoogleSignIn } from "@/services/native-auth";
import { getDefaultRouteForRole } from "@/utils/routeGuard";

const learnerOptions = [
    { label: "I am a parent filling this profile", value: "parent" },
    { label: "I am filling for myself", value: "self" },
];

const DateOfBirthInput = ({ value, onChange }: { value: any; onChange: (value: any) => void }) => (
    <Input
        name="dob"
        label="Select your Date of Birth"
        inputType="birthdatepicker"
        value={value}
        onChange={onChange}
        birthDatePicker={{ minAge: 13, maxAge: 100 }}
    />
);

const GoogleSignUpButton = ({
    disabled,
    onClick,
    loading,
}: {
    disabled: boolean;
    onClick: () => void;
    loading: boolean;
}) => (
    <Button
        loading={loading}
        disabled={disabled}
        title="Sign Up With Google"
        className="!bg-black w-full !px-3 !py-2 !text-white hover:!bg-black hover:!text-white text-sm !rounded-xl"
        icon={<FcGoogle className="text-xl" />}
        onClick={onClick}
    />
);

const LearnerModalBody = ({
    handleSignUp,
    isLoading,
}: {
    handleSignUp: (payloads: any) => void;
    isLoading: boolean;
}) => {
    const [enrolledBy, setEnrolledBy] = useState("parent");
    const [dob, setDob] = useState("");

    const handleClick = () => {
        if (enrolledBy === "self" && !dob) return;
        const payloads =
            enrolledBy === "self"
                ? { signup_type: "learner", enrolled_by: enrolledBy, date_of_birth: dob }
                : { signup_type: "learner", enrolled_by: enrolledBy };
        handleSignUp(payloads);
    };

    return (
        <div className="flex flex-col gap-5">
            <Radio.Group
                value={enrolledBy}
                onChange={(e) => setEnrolledBy(e.target.value)}
                className="w-full space-y-2 pb-5 border-b border-b-gray-300"
            >
                {learnerOptions.map((option) => (
                    <Radio
                        key={option.value}
                        value={option.value}
                        className="flex items-center p-2 text-base border rounded-lg cursor-pointer bg-background-input hover:border-gray-400"
                    >
                        {option.label}
                    </Radio>
                ))}
            </Radio.Group>

            {enrolledBy === "self" ? (
                <div>
                    <DateOfBirthInput value={dob} onChange={setDob} />
                    <div className="rounded-md p-3 text-xs bg-background-input text-gray-light">
                        <span className="text-black font-medium mr-1">Note:</span>
                        Learners under 13 should be onboarded by a parent.
                    </div>
                </div>
            ) : (
                <div className="rounded-md p-3 text-xs bg-background-input text-gray-light">
                    <span className="text-black font-medium mr-1">Note:</span>
                    If the learner is over 13 but has limited legal or decision-making capacity, a
                    parent or guardian should complete the form and schedule their sessions on their
                    behalf.
                </div>
            )}

            <GoogleSignUpButton
                loading={isLoading}
                disabled={enrolledBy === "self" && !dob}
                onClick={handleClick}
            />
        </div>
    );
};

const VolunteerModalBody = ({
    handleSignUp,
    isLoading,
}: {
    handleSignUp: (payloads: any) => void;
    isLoading: boolean;
}) => {
    const [dob, setDob] = useState("");
    return (
        <div className="flex flex-col gap-4">
            <div>
                <DateOfBirthInput value={dob} onChange={setDob} />
                <div className="rounded-md p-3 text-xs bg-background-input text-gray-light">
                    <span className="text-black font-medium mr-1">Note:</span>
                    The minimum age to volunteer in MelodyWings should be 13.
                </div>
            </div>
            <GoogleSignUpButton
                loading={isLoading}
                disabled={!dob}
                onClick={() => handleSignUp({ signup_type: "volunteer", date_of_birth: dob })}
            />
        </div>
    );
};

const SignUpAsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const router = useRouter();
    const [role] = useQueryState("signup_as");
    const [modalLoader, setModalLoader] = useState(false);

    const [isSignUpLoading, setIsSignUpLoading] = useState(false);
    const [signupPayload, setSignupPayload] = useState<any>(null);

    const SIGN_UP = async (access_token: any, payloads: any) => {
        setIsSignUpLoading(true);

        await apiGoogleSignUp(access_token, payloads)
            .then((response: any) => {
                setModalLoader(true);
                const { onboarded_status } = response;
                console.log("response from signup", onboarded_status);
                const role = getCookie("role") as "learner" | "volunteer" | undefined;
                const defaultRoute = getDefaultRouteForRole(role);
                const routes: Record<string, string> = {
                    details_pending: "/onboarding",
                    partially_filled: "/onboarding",
                    verification_pending: "/onboarding/verification",
                    verification_rejected: "/onboarding/verification",
                    verification_completed: defaultRoute,
                };
                if (routes[onboarded_status]) {
                    console.log("pushing to", routes[onboarded_status]);
                    router.push(routes[onboarded_status]);
                    // router.refresh();
                }
            })
            .catch((err) => {
                setIsSignUpLoading(false);
                setModalLoader(false);
                showToast({ type: "error", message: err?.response?.data?.detail });
            });
    };

    const webGoogleLogin = useGoogleLogin({
        onSuccess: async (response) => {
            if (response?.access_token && signupPayload) {
                SIGN_UP(response.access_token, signupPayload);
            }
        },
        onError: (error) => console.error("Google Login Error:", error),
    });

    const handleSignUp = async (payloads: any) => {
        setSignupPayload(payloads);
        if (isNativePlatform()) {
            // Native Android: use Capacitor Google Auth
            setIsSignUpLoading(true);
            try {
                const accessToken = await nativeGoogleSignIn();
                if (accessToken) {
                    await SIGN_UP(accessToken, payloads);
                } else {
                    setIsSignUpLoading(false);
                    showToast({ type: "error", message: "Google Sign-In failed. Please try again." });
                }
            } catch (error) {
                setIsSignUpLoading(false);
                showToast({ type: "error", message: "Google Sign-In failed. Please try again." });
            }
        } else {
            // Web: use @react-oauth/google
            webGoogleLogin();
        }
    };

    return (
        <div>
            <ModalLoader
                isLoading={isSignUpLoading || modalLoader}
                title={modalLoader ? "Signing up..." : "Validating User..."}
            />
            <Modal
                open={isOpen}
                onCancel={onClose}
                className="max-w-[90%] h-full top-0 flex-center"
                classNames={{ content: "!rounded-3xl !p-6" }}
                closable={false}
                footer={false}
            >
                <div className="w-full md:w-[450px]">
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-medium">Enroll as {role}</span>
                        <ModalCloseIcon
                            onClick={onClose}
                            width={35}
                            height={35}
                            className="cursor-pointer rounded-full hover:shadow-lg"
                        />
                    </div>
                    <div className="mt-5">
                        {role === "learner" ? (
                            <LearnerModalBody
                                handleSignUp={handleSignUp}
                                isLoading={isSignUpLoading}
                            />
                        ) : (
                            <VolunteerModalBody
                                handleSignUp={handleSignUp}
                                isLoading={isSignUpLoading}
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SignUpAsModal;
