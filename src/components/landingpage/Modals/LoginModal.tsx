import ModalCloseIcon from "@/assets/icons/ModalCloseIcon"
import Button from "@/components/common/Button"
import { Modal } from "antd"
import { FcGoogle } from "react-icons/fc"
import { useQueryState } from "nuqs"
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react"
import { apiGoogleLogin } from "@/api/auth"
import { useRouter } from "next/navigation"
import { getCookie } from "@/utils/auth"
import { showToast } from "@/components/common/Toast"
import ModalLoader from "@/components/common/Loader/Modal"
import { isNativePlatform } from "@/utils/platform"
import { nativeGoogleSignIn } from "@/services/native-auth"
import { getDefaultRouteForRole } from "@/utils/routeGuard"

export const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const router = useRouter();
    const [_, setParamMode] = useQueryState("signup_as");
    const [modalLoader, setModalLoader] = useState(false);
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    const handleTriggerSignUp = (role: UserType) => {
        setParamMode(role);
        onClose();
    }
    const SIGN_IN = async (access_token: any) => {
        setIsLoginLoading(true);
        await apiGoogleLogin(access_token)
            .then((response: any) => {
                setModalLoader(true);
                const { onboarded_status } = response;
                const role = getCookie("role") as "learner" | "volunteer" | undefined;
                const defaultRoute = getDefaultRouteForRole(role);
                const routes: Record<string, string> = {
                    details_pending: "/onboarding",
                    partially_filled: "/onboarding",
                    verification_pending: "/onboarding/verification",
                    verification_rejected: "/onboarding/verification",
                    verification_completed: defaultRoute,
                };

                if (routes[onboarded_status]) router.replace(routes[onboarded_status]);
                router.refresh();
            })
            .catch(err => {
                setIsLoginLoading(false);
                setModalLoader(false);
                // apiGoogleLogin uses a raw axios call, so the status is on err.response.
                const status = err?.response?.status ?? err?.status;
                if (status === 404) {
                    return showToast({ type: "error", message: "User not found, please signup." });
                }
                showToast({ type: "error", message: "Sign in failed. Please try again." });
            })
    };

    const webGoogleLogin = useGoogleLogin({
        onSuccess: async (response) => SIGN_IN(response?.access_token),
    });

    const handleGoogleLogin = async () => {
        if (isNativePlatform()) {
            // Native Android: use Capacitor Google Auth
            setIsLoginLoading(true);
            try {
                const accessToken = await nativeGoogleSignIn();
                if (accessToken) {
                    await SIGN_IN(accessToken);
                } else {
                    setIsLoginLoading(false);
                    showToast({ type: "error", message: "Google Sign-In failed. Please try again." });
                }
            } catch (error) {
                setIsLoginLoading(false);
                showToast({ type: "error", message: "Google Sign-In failed. Please try again." });
            }
        } else {
            // Web: use @react-oauth/google
            webGoogleLogin();
        }
    };

    return (
        <div>
            <ModalLoader isLoading={isLoginLoading || modalLoader} title={modalLoader ? "Logging in..." : "Validating User..."} />
            <Modal
                open={isOpen}
                onCancel={onClose}
                className='w-full max-md:!max-w-[100%] px-4 absolute right-0 md:right-10 top-[25%] md:top-20'
                classNames={{ content: '!rounded-3xl !p-5' }}
                closable={false}
                footer={false}
            >
                <div className='w-full'>
                    <div className='flex justify-between items-center'>
                        <span className='text-xl font-medium'>Existing User?</span>
                        <ModalCloseIcon onClick={onClose} width={35} height={35} className='cursor-pointer rounded-full hover:shadow-lg' />
                    </div>
                    <div className='mt-3 flex flex-col gap-5 divide-y'>
                        <Button
                            title='Sign In With Google'
                            className='!bg-black w-full !px-3 !py-2 text-white hover:!bg-black hover:!text-white text-sm !rounded-xl'
                            icon={<FcGoogle className='text-xl' />}
                            loading={isLoginLoading}
                            onClick={handleGoogleLogin}
                        />
                        <div className="pt-4">
                            <span className='text-xl font-medium'>New User?</span>
                            <div className="flex flex-col md:flex-row gap-3 mt-3">
                                <Button
                                    // loading={buttonLoading === "learner"}
                                    onClick={() => handleTriggerSignUp("learner")}
                                    title="Enroll as Learner"
                                    btnVariant="learner"
                                    size="small"
                                    customClassName="!w-full !text-start"
                                />
                                <Button
                                    // loading={buttonLoading === "volunteer"}
                                    onClick={() => handleTriggerSignUp("volunteer")}
                                    title="Become a Volunteer"
                                    btnVariant="volunteer"
                                    size="small"
                                    customClassName="!w-full !text-start"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )

}
