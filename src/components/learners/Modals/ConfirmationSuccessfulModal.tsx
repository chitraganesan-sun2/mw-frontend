"use client";

import React from "react";
import Image from "next/image";
import CenterModal from "@/components/common/Modals/CenterModal";
import Button from "@/components/common/Button";
import { TimeIcon, HostedByIcon, VerifyTickIcon } from "@/assets/icons";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import PersonImg from "@/assets/images/Person.png";
import useInnerWidth from "@/hooks/useInnerWidth";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface ConfirmationSuccessfulModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: {
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        timezone: string;
        duration: string;
        instructor: {
            name: string;
            profilePicture?: string;
        };
        meetingLink?: string;
        guests?: string[];
        is_learner?: boolean;
    };
    onCancelMeeting?: () => void | Promise<void>;
    onJoinMeeting?: () => void;
}

const ConfirmationSuccessfulModal: React.FC<ConfirmationSuccessfulModalProps> = ({
    isOpen,
    onClose,
    session,
    onCancelMeeting,
    onJoinMeeting,
}) => {
    const { copied, copy } = useCopyToClipboard();

    const handleCopyLink = () => {
        if (session.meetingLink) {
            copy(session.meetingLink);
        }
    };

    const handleJoinMeeting = () => {
        if (session.meetingLink) {
            window.open(session.meetingLink, "_blank");
        }
    };

    const handleCancelMeeting = async () => {
        // Close modal immediately when cancel is clicked
        onClose();
        // Then trigger the cancel meeting handler (which will show loader)
        if (onCancelMeeting) {
            await onCancelMeeting();
        }
    };

    const innerWidth = useInnerWidth();
    const isMobile = innerWidth > 0 && innerWidth < 768;
    const mobileFullScreenHeight = typeof window !== "undefined" ? window.innerHeight : 900;

    const cancelMeetingButton = (
        <div className="flex justify-end">
            <Button
                title="Cancel Meeting"
                btnVariant="tertiary"
                customClassName="!h-10 !bg-white !text-red-600 !border !border-red-600 hover:!bg-red-50 !font-medium !rounded-full !px-6"
                onClick={handleCancelMeeting}
            />
        </div>
    );

    const scrollableContent = (
        <>
            <div className="absolute left-0 right-0 -top-6 border-t border-gray-200" style={{ left: "8px", right: "8px" }} />
            <h3 className="text-[20px] font-medium text-[#121212] mb-4">{session.title}</h3>

            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center !mb-1 w-4 h-4 text-gray-600 flex-shrink-0">
                            <TimeIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-[#4F4F4F]">Duration</span>
                    </div>
                    <span className="text-sm font-medium text-[#121212]">
                        {session.startTime} - {session.endTime} {session.timezone} ({session.duration})
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-4 h-4 !mb-1 text-gray-600 flex-shrink-0">
                            <HostedByIcon />
                        </div>
                        <span className="text-sm font-medium text-[#4F4F4F]">Hosted By</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                                src={
                                    session.instructor.profilePicture &&
                                    session.instructor.profilePicture !== "/dummy-profile.webp"
                                        ? session.instructor.profilePicture
                                        : PersonImg
                                }
                                alt={session.instructor.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-sm font-medium text-[#121212]">{session.instructor.name}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl py-3 mb-4">
                <div className="flex items-start justify-between gap-2 pb-2 flex-wrap">
                    <div className="flex flex-col gap-1 min-w-0">
                        <Button
                            title="Join with Google Meet"
                            btnVariant="secondary"
                            customClassName="!w-full max-w-[207px] !h-11 !bg-[#68DBFF] !text-[#121212] hover:!bg-[#B3E5FC] !font-medium !rounded-xl"
                            onClick={handleJoinMeeting}
                        />
                        <div className="w-full max-w-[207px] mt-0">
                            {session.meetingLink ? (
                                <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[12px] text-[#000000] font-medium hover:underline break-words"
                                >
                                    {session.meetingLink}
                                </a>
                            ) : (
                                <span className="text-[12px] text-[#000000] font-medium">—</span>
                            )}
                        </div>
                    </div>
                    <Button
                        title={copied ? "Copied!" : "Copy Link"}
                        btnVariant="tertiary"
                        customClassName="!w-[100px] !h-8 !bg-white !text-black !border !border-gray-300 !px-6 !mt-4 !rounded-full flex items-center justify-center flex-shrink-0"
                        onClick={handleCopyLink}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-4 relative py-2">
                <div className="absolute left-0 right-0 -top-4 border-t border-gray-200" style={{ left: "0px", right: "0px" }} />
                <span className="text-sm font-medium text-[#4F4F4F]">Guest</span>
                <div className="flex flex-wrap gap-1">
                    {session.guests && session.guests.length > 0 ? (
                        session.guests.map((guest, index) => {
                            const guestsLength = session.guests?.length ?? 0;
                            return (
                                <span key={index} className="text-sm font-medium text-[#121212] md:text-gray-700">
                                    {guest}
                                    {index === 0 && " (Host)"}
                                    {index < guestsLength - 1 && ", "}
                                </span>
                            );
                        })
                    ) : (
                        <span className="text-sm text-[#4F4F4F]">—</span>
                    )}
                </div>
                <div className="absolute left-0 right-0 -bottom-4 border-t border-gray-200" style={{ left: "0px", right: "0px" }} />
            </div>
        </>
    );

    const modalBodyContent = isMobile ? (
        <div className="flex flex-col h-full min-h-0 max-md:h-full">
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-4 relative">
                {scrollableContent}
            </div>
            <div className="flex-shrink-0 border-t border-gray-200 py-4 px-6 bg-white">
                {cancelMeetingButton}
            </div>
        </div>
    ) : (
        <div className="flex flex-col relative">
            {scrollableContent}
            <div className="border-t border-gray-200 -mx-6 my-4" />
            {cancelMeetingButton}
        </div>
    );

    return (
        <CenterModal
            isOpen={isOpen}
            onClose={onClose}
            width={500}
            height={undefined}
            mobileWidth={isMobile ? innerWidth : undefined}
            mobileHeight={isMobile ? mobileFullScreenHeight : undefined}
            zIndex={2000}
            hideCloseIcon={isMobile}
            headerComponent={
                isMobile ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <VerifyTickIcon className="w-[26px] h-[26px]" />
                            <h2 className="text-[20px] font-medium text-[#121212]">Confirmation Successfull</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 active:scale-90 transition-all inline-flex items-center justify-center"
                            aria-label="Close"
                        >
                            <ModalCloseIcon className="w-[32px] h-[32px]" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <VerifyTickIcon className="md:w-6 md:h-6 w-[26px] h-[26px]" />
                            </div>
                            <h2 className="text-[20px] font-medium text-[#121212]">Confirmation Successfull</h2>
                        </div>
                    </div>
                )
            }
            headerClassName="!px-6 !py-5 !border-0 !justify-between relative"
            bodyClassName="!px-6 !pt-6 !pb-6 relative max-md:!flex max-md:!flex-col max-md:!overflow-hidden max-md:!min-h-0 max-md:!p-0"
            customClassName="max-md:!rounded-none max-md:!w-full max-md:!max-w-none !rounded-2xl [&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!overflow-hidden [&_*[class*='dot']]:!hidden [&_*[class*='pagination']]:!hidden [&_*[class*='indicator']]:!hidden [&_.ant-modal-close]:!pr-2 max-md:[&_.ant-modal-content]:!rounded-none"
            rootClassName="!overflow-hidden max-md:!rounded-none md:!rounded-2xl"
            hideFooter={true}
        >
            {modalBodyContent}
        </CenterModal>
    );
};

export default ConfirmationSuccessfulModal;
