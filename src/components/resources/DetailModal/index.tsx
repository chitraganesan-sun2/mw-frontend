"use client";

import { motion } from "framer-motion";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import ReportIcon from "@/assets/icons/ReportIcon";
import Divider from "@/components/common/Divider";
import TagComponent from "@/components/common/Tag";
import Image from "next/image";
import Link from "next/link";
import ViewModal from "@/components/common/Modals/ViewModal";
import { useQueryState } from "nuqs";
import Button from "@/components/common/Button";
import { IoTrashOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { deleteResource, dislikeResource, getSingleResource, likeResource } from "@/api/resources";
import { showToast } from "@/components/common/Toast";
import { useState } from "react";
import { HeartLikeIcon, UnlikeHeartIcon } from "@/assets/icons";
import LottieLoader from "@/components/common/Loader/Lottie";
import { safeHref } from "@/utils/safeHref";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type DetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    triggerReload: () => void;
    handleUserLikeAction: (id: string, status: boolean) => void;
    handleReportClick?: (id: string) => void;
};

const DetailModal = ({
    handleUserLikeAction,
    triggerReload,
    isOpen,
    onClose,
    handleReportClick,
}: DetailModalProps) => {
    const [category] = useQueryState("category");
    const [resourceId] = useQueryState("id");
    const [mode, setMode] = useQueryState("mode");

    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likedCount, setLikedCount] = useState(0);

    const isMyResource = category === "my-resources";
    const isMobile = useMediaQuery("(max-width: 768px)");

    const { data: resource, isFetching } = useQuery({
        queryKey: ["resource-single", resourceId],
        queryFn: async () => {
            if (!resourceId) return null;
            const data = await getSingleResource(resourceId);
            setIsLiked(data?.is_liked || false);
            setLikedCount(data?.total_likes || 0);
            return data;
        },
        enabled: Boolean(resourceId),
    });

    const handleLikeDislike = async (status: boolean) => {
        if (!resourceId) return;
        setIsLiked(status);
        setLikedCount((prev) => prev + (status ? 1 : -1));
        handleUserLikeAction(resourceId, status);
        status ? await likeResource(resourceId) : await dislikeResource(resourceId);
    };

    const handleEdit = () => setMode("edit");

    const handleDelete = async () => {
        if (!resourceId) return;
        setIsDeleting(true);
        const res = await deleteResource(resourceId);
        if (res === 200) {
            showToast({ message: "Resource Deleted" });
            triggerReload();
        } else {
            showToast({ message: "Resource not deleted", type: "error" });
        }
        onClose();
        setIsDeleting(false);
    };

    const renderSkills = () =>
        resource?.resource_skills?.map((item: any, index: number) => (
            <TagComponent
                key={index}
                text={item?.skill_name}
                className="!py-0 !px-4 !text-[0.75rem] w-fit"
            />
        ));

    const renderCuratedLinks = () =>
        resource?.curated_links?.map((item: any, index: number) => {
            const href = safeHref(item?.url);
            return (
                <p key={index}>
                    {index + 1}. {item?.title} -{" "}
                    {href ? (
                        <Link href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            {item?.url}
                        </Link>
                    ) : (
                        <span className="text-gray break-all">{item?.url}</span>
                    )}
                </p>
            );
        });

    if (!resourceId) return null;

    return (
        <ViewModal
            modalOpen={isOpen}
            onClose={onClose}
            width={isMobile ? "100%" : 800}
            height="100%"
            className={isMobile ? "!p-0 !m-0 !h-screen !max-h-none !w-screen !max-w-none" : ""}
        >
            {isFetching ? (
                <div className={` w-full flex-center ${isMobile ? "h-screen" : "min-h-[70vh]"}`}>
                    <LottieLoader isLoading={true} />
                </div>
            ) : (
                <div className={`flex flex-col ${isMobile ? "h-screen" : ""}`}>
                    <div
                        className={`relative bg-[#F4F7FB] ${isMobile ? "h-[250px] sm:h-[280px]" : "h-[300px]"} rounded-t-xl ${isMobile ? "!rounded-none" : ""
                            }`}
                    >
                        <Image
                            src={resource?.resource_image?.image_url || "/placeholder.png"}
                            fill
                            className="object-contain min-w-[60%]"
                            alt="Resource"
                        />
                        <span
                            onClick={onClose}
                            className="cursor-pointer absolute top-4 left-4 md:static md:top-auto md:left-auto md:hidden"
                        >
                            <ModalCloseIcon />
                        </span>
                        <div className="flex items-center gap-4 w-fit absolute top-4 right-4">
                            {isMyResource ? (
                                <Button
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                    customClassName="rounded-full !px-4 !gap-1 !text-sm hover:!text-error hover:!bg-error-light !h-[35px] hover:!border-none !border-none"
                                    btnVariant="error"
                                    title="Delete"
                                    icon={<IoTrashOutline size={16} />}
                                />
                            ) : (
                                <div className="h-full px-4 py-2.5 rounded-full bg-[#FEE2E299]/50 flex items-center gap-2 backdrop-blur-[5px]">
                                    {isLiked ? (
                                        <motion.div
                                            key="liked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            onClick={() => handleLikeDislike(false)}
                                        >
                                            <HeartLikeIcon className="cursor-pointer" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="unliked"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            onClick={() => handleLikeDislike(true)}
                                        >
                                            <UnlikeHeartIcon className="cursor-pointer" />
                                        </motion.div>
                                    )}
                                    <p className="text-sm font-medium text-black">{likedCount}</p>
                                </div>
                            )}
                            <span className="cursor-pointer">
                                {isMyResource ? (
                                    <Button
                                        onClick={handleEdit}
                                        rootClassName="!bg-background-input !px-5 !text-sm !h-[35px]"
                                        size="small"
                                        title="Edit"
                                        icon={<MdEdit size={16} />}
                                    />
                                ) : (
                                    <span
                                        onClick={() => handleReportClick?.(resource?.resource_id)}
                                    >
                                        <ReportIcon />
                                    </span>
                                )}
                            </span>
                            <span onClick={onClose} className="md:block hidden cursor-pointer">
                                <ModalCloseIcon />
                            </span>
                        </div>
                    </div>
                    <div
                        className={`flex flex-col gap-4 px-4 md:px-6 lg:px-8 py-4 overflow-y-auto ${isMobile ? "flex-1 pb-8" : ""
                            }`}
                    >
                        <div className="flex flex-wrap items-center justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-2xl font-medium text-black">
                                    {resource?.resource_title}
                                </p>
                                <span className="text-sm font-medium text-gray-light">
                                    By {resource?.author?.name}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-light capitalize">
                                Level: {resource?.difficulty_level || "N/A"}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-black">Description</p>
                            <p className="text-sm text-gray-light">
                                {resource?.resource_description || "No description provided."}
                            </p>
                        </div>
                        <Divider />
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-black">Skills you gain</p>
                            <div className="flex flex-wrap gap-y-2">{renderSkills()}</div>
                        </div>
                        <Divider />
                        <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                            <p className="font-medium text-black">Curated Links</p>
                            {resource?.curated_links?.length > 0 ? (
                                <div className="flex flex-col gap-2">{renderCuratedLinks()}</div>
                            ) : (
                                <p className="text-sm text-gray-light">
                                    No curated links provided.
                                </p>
                            )}
                        </div>
                        <Divider />
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-black">Notes</p>
                            <p className="text-sm text-gray-light">
                                {resource?.resource_notes || "No notes provided."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </ViewModal>
    );
};

export default DetailModal;
