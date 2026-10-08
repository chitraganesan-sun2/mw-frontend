"use client";

import ViewModal from "@/components/common/Modals/ViewModal";
import Image from "next/image";
import VideoPlayer from "@/components/common/VideoPlayer";
import TagComponent from "@/components/common/Tag";
import { roleTagClass } from "@/components/common/Tag/roleTagClass";
import Divider from "@/components/common/Divider";
import CommentCard from "@/components/community/CommentCard";
import { DeleteIcon, EditIcon, FeedModalCloseIcon } from "@/assets/icons";
import ReportIcon from "@/assets/icons/ReportIcon";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/api/constants";
import { GET_API, DELETE_API } from "@/api/request";
import CommentInput from "../CommentInput";
import React, { useEffect, useRef, useState } from "react";
import { POST_API } from "@/api/request";
import { callbackToast, showToast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/utils/apiError";
import { safeImageSrc } from "@/utils/safeHref";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import { getCookie } from "@/utils/auth";
import { IoIosClose } from "react-icons/io";
import LottieLoader from "@/components/common/Loader/Lottie";
import CommentSkeleton from "../CommentCard/skeleton";
import ErrorMsg from "@/components/common/Messages/ErrorMsg";
import { useQueryState } from "nuqs";
import { BsFillBookmarkFill, BsBookmark } from "react-icons/bs";
import ConfirmModal from "@/components/common/Modals/ConfirmModal";
import { useMediaQuery } from "@mui/material";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toUserTimeZone } from "@/utils/timeFunctions";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CustomNextArrow = (props: any) => {
    const { onClick } = props;
    return (
        <button
            type="button"
            aria-label="Next image"
            onClick={onClick}
            className="!z-50 absolute right-3 top-1/2 transform -translate-y-1/2 text-primary border border-primary bg-gray-200 p-2 rounded-full shadow-md cursor-pointer appearance-none"
        >
            <FaChevronRight className="text-xs md:text-lg" />
        </button>
    );
};

const CustomPrevArrow = (props: any) => {
    const { onClick } = props;
    return (
        <button
            type="button"
            aria-label="Previous image"
            onClick={onClick}
            className="!z-50 absolute left-3 top-1/2 transform -translate-y-1/2 text-primary border border-primary bg-gray-200 p-2 rounded-full shadow-md cursor-pointer appearance-none"
        >
            <FaChevronLeft className="text-xs md:text-lg" />
        </button>
    );
};

const sliderSettings = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 1000,
    arrows: true,
    adaptiveHeight: false,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
};

type FeedViewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    handleReportClick?: (id: string) => void;
    isManagePost?: boolean;
};

interface PostData {
    description: string;
    images: {
        image_url: string;
        image_id: string;
    }[];
    video?: { video_url: string; video_id: string } | null;
    created_by: string;
    post_id: string;
    author: {
        name: string;
        profile_picture: {
            image_url: string;
            image_id: string;
        };
    };
    created_at: string;
    is_liked: boolean;
    is_saved: boolean;
    total_likes: number;
    total_comments: number;
}

const FeedViewModal = ({
    isOpen,
    onClose,
    handleReportClick,
    isManagePost,
}: FeedViewModalProps) => {
    const queryClient = useQueryClient();
    const [activeTab] = useQueryState("tab");

    const role = getCookie("role");

    const [mode, setMode] = useQueryState("mode");
    const [id, setId] = useQueryState("id");

    const [comment, setComment] = useState("");
    const [isCommentLoading, setIsCommentLoading] = useState(false);

    const [isCommentFocused, setIsCommentFocused] = useState(false);
    const [replyTo, setReplyTo] = useState({ name: "", id: "" });

    // The modal stays mounted between posts, so a draft comment / "Replying to" target
    // from post A must not carry over to post B (it would post B's comment with A's
    // parent_comment_id). Reset whenever the viewed post changes or the modal closes.
    useEffect(() => {
        setComment("");
        setReplyTo({ name: "", id: "" });
    }, [id, isOpen]);

    const getIndividualPost = async () => {
        const response = await GET_API(endpoints.post.getSinglePost(id as string));
        return response.data;
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ["get-single-post", id],
        queryFn: getIndividualPost,
        enabled: !!id && mode === "view",
    });

    const getPostComments = async () => {
        const response = await GET_API(endpoints.comment.getPostComments(id as string));
        return response.data;
    };

    const { data: commentsData, isLoading: commentsLoading } = useQuery({
        queryKey: ["get-post-comments", id],
        queryFn: getPostComments,
        enabled: !!id,
    });

    const post = data as PostData;
    // Only URLs next/image can render - a bad one in API data would otherwise throw and
    // take the page down. Unsafe images are skipped.
    const safeImages = (post?.images ?? []).flatMap((image) => {
        const src = safeImageSrc(image?.image_url);
        return src ? [{ image_id: image.image_id, src }] : [];
    });

    const handleCloseModal = () => {
        onClose();
    };

    const handleReplyName = (name: string, id: string) => {
        setReplyTo({ name, id });
    };

    const handleEditClick = (postId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMode("edit");
        setId(postId);
    };

    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const hanldeDeleteEvent = (postId: string) => {
        setDeleteTargetId(postId);
    };

    const confirmDeletePost = () => {
        if (!deleteTargetId) return;
        const deletedId = deleteTargetId;
        callbackToast({
            apiCall: DELETE_API(endpoints.post.deletePost(deletedId)),
            loadingMsg: "Deleting Post",
            errorMsg: "Post not Deleted",
            successMsg: "Post Deleted",
        })
            .then(() => {
                // The post is gone - don't leave the modal open on it.
                handleCloseModal();
                queryClient.removeQueries({ queryKey: ["get-single-post", deletedId] });
                queryClient.removeQueries({ queryKey: ["get-post-comments", deletedId] });
                queryClient.invalidateQueries({ queryKey: ["get-posts"] });
            })
            // toast.promise re-rejects on failure; the error toast is already shown.
            .catch(() => {});
        setDeleteTargetId(null);
    };

    const isSavePending = useRef(false);

    const handleSavePost = async (postId: string, currentSaveStatus: boolean) => {
        if (isSavePending.current) return;
        isSavePending.current = true;
        const setSaved = (saved: boolean) =>
            queryClient.setQueryData(["get-single-post", postId], (oldData: any) =>
                oldData ? { ...oldData, is_saved: saved } : oldData
            );

        setSaved(!currentSaveStatus);
        try {
            if (currentSaveStatus) {
                await DELETE_API(endpoints.post.unsave(postId));
            } else {
                await POST_API(endpoints.post.save(postId));
            }
        } catch (err) {
            setSaved(currentSaveStatus);
            showToast({ type: "error", message: getApiErrorMessage(err, "Couldn't update saved posts. Please try again.") });
        } finally {
            isSavePending.current = false;
            // A precise setQueryData needs the exact live search-query segment the feed list is
            // cached under (["get-posts", activeTab, debouncedSearchQuery]), which this modal
            // doesn't have - invalidate by prefix instead so the list refetches with the
            // correct saved state regardless of search.
            queryClient.invalidateQueries({ queryKey: ["get-posts", activeTab] });
        }
    };

    const handleComment = async (postId: string) => {
        setIsCommentLoading(true);

        let payload = {
            comment_text: comment,
            created_by: role,
            post_id: postId,
            parent_comment_id: replyTo.id || "",
        };
        await callbackToast({
            apiCall: POST_API(endpoints.comment.createComment, payload),
            loadingMsg: "Posting Comment",
            successMsg: "Comment Posted Successfully",
            errorMsg: "Couldn't post your comment. Please try again.",
        })
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["get-post-comments", id] });
                setComment("");
            })
            // toast.promise re-rejects on failure, so the reset must not live in .then -
            // otherwise a failed post left the comment button stuck in its loading state.
            .catch(() => {})
            .finally(() => setIsCommentLoading(false));
    };

    const handleReplyClose = () => {
        setReplyTo({ name: "", id: "" });
    };

    const isMobile = useMediaQuery("(max-width: 767px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");

    return (
        <>
        <ViewModal
            className="max-md:!w-full max-md:!max-w-none max-md:!h-full lg:!h-[720px] md:!rounded-xl"
            modalOpen={isOpen}
            onClose={handleCloseModal}
            width={isMobile ? "100dvw" : isTablet ? "95dvw" : 1200}
            height={isMobile ? "100dvh" : isTablet ? "95dvh" : "720px"}
            isLoading={isLoading}
            isError={isError}
        >
            {isLoading ? (
                <div className="h-full w-full max-md:!h-[100dvh] min-h-[80vh] flex-center">
                    <LottieLoader isLoading={true} />
                </div>
            ) : isError ? (
                <ErrorMsg />
            ) : (
                <div className="h-full lg:h-[720px] flex max-lg:!flex-col">
                    <div className="lg:w-[55%] relative bg-gray-300 w-full h-[300px] md:h-[400px] lg:h-[720px] max-md:!max-h-[40%] overflow-hidden">
                        {safeImages.length > 0 ? (
                            <Slider className="flex gap-20" {...sliderSettings}>
                                {safeImages.map((image) => (
                                    <div key={image.image_id} className="relative w-full h-[300px] md:h-[400px] lg:h-[720px]">
                                        <Image
                                            src={image.src}
                                            alt="feed image"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        ) : !post?.images?.length && post?.video?.video_url ? (
                            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[720px]">
                                <VideoPlayer src={post.video.video_url} className="w-full h-full" />
                            </div>
                        ) : null}
                        <div className="lg:hidden absolute top-0 left-0 !w-full flex justify-between items-center px-5 pb-2 pt-5 gap-3">
                            <button type="button" aria-label="Close" onClick={handleCloseModal} className="bg-transparent border-0 p-0">
                                <FeedModalCloseIcon className="cursor-pointer" />
                            </button>
                            {isManagePost ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        aria-label="Edit post"
                                        onClick={(e) => handleEditClick(post.post_id, e)}
                                        className="cursor-pointer bg-transparent border-0 p-0"
                                    >
                                        <EditIcon width={40} height={40} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Delete post"
                                        onClick={() => hanldeDeleteEvent(post.post_id)}
                                        className="cursor-pointer bg-transparent border-0 p-0"
                                    >
                                        <DeleteIcon width={40} height={40} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        aria-label={post?.is_saved ? "Unsave post" : "Save post"}
                                        className="cursor-pointer bg-white rounded-full p-2.5 border border-gray-100"
                                        onClick={() =>
                                            handleSavePost(post?.post_id, post?.is_saved)
                                        }
                                    >
                                        {post?.is_saved ? (
                                            <BsFillBookmarkFill size={20} />
                                        ) : (
                                            <BsBookmark size={20} />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Report post"
                                        className="cursor-pointer border rounded-full bg-transparent"
                                        onClick={() => handleReportClick?.(post?.post_id)}
                                    >
                                        <ReportIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:w-[45%] flex flex-col max-lg:!flex-1 lg:h-[720px] relative max-lg:!overflow-y-auto">
                        <div className="max-lg:hidden flex justify-end items-center px-5 pb-2 pt-5 gap-3">
                            {isManagePost ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        aria-label="Edit post"
                                        onClick={(e) => handleEditClick(post.post_id, e)}
                                        className="cursor-pointer bg-transparent border-0 p-0"
                                    >
                                        <EditIcon width={40} height={40} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Delete post"
                                        onClick={() => hanldeDeleteEvent(post.post_id)}
                                        className="cursor-pointer bg-transparent border-0 p-0"
                                    >
                                        <DeleteIcon width={40} height={40} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        aria-label={post?.is_saved ? "Unsave post" : "Save post"}
                                        className="cursor-pointer bg-transparent border-0 p-0"
                                        onClick={() =>
                                            handleSavePost(post?.post_id, post?.is_saved)
                                        }
                                    >
                                        {post?.is_saved ? (
                                            <BsFillBookmarkFill size={20} />
                                        ) : (
                                            <BsBookmark size={20} />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Report post"
                                        className="cursor-pointer border rounded-full bg-transparent"
                                        onClick={() => handleReportClick?.(post?.post_id)}
                                    >
                                        <ReportIcon />
                                    </button>
                                </div>
                            )}
                            <button type="button" aria-label="Close" onClick={handleCloseModal} className="bg-transparent border-0 p-0">
                                <FeedModalCloseIcon className="cursor-pointer" />
                            </button>
                        </div>
                        <Divider />
                        <div className="px-4 md:px-7 flex flex-col mt-3 overflow-y-auto relative">
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <div className="w-[40px] h-[40px] relative flex-shrink-0">
                                        <Image
                                            src={safeImageSrc(post?.author?.profile_picture?.image_url) || DummyProfileImg}
                                            alt="profile picture"
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="ml-2md:ml-3 flex-1 flex flex-col">
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full min-h-[40px]">
                                            <p className="font-medium md:font-semibold text-black">
                                                {post?.author?.name}
                                            </p>
                                            <div className="w-1.5 h-1.5 rounded-full bg-action"></div>
                                            <TagComponent
                                                text={post?.created_by}
                                                className="w-fit capitalize !m-0"
                                                tagClassName={roleTagClass(post?.created_by)}
                                            />
                                            <div className="w-1.5 h-1.5 rounded-full bg-action"></div>
                                            <p className="font-medium md:font-semibold text-black">
                                                {toUserTimeZone({ date: post?.created_at, format: "DD-MMM-YYYY" })}
                                            </p>
                                        </div>

                                        <p className="text-sm font-normal mt-2">{post?.description}</p>
                                    </div>
                                </div>
                                <Divider />
                            </div>
                            <div className="flex flex-col mt-3 sticky top-0">
                                <h3 className="text-xl font-semibold text-black mb-3">Comments</h3>
                                <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-[75px] pr-3 hide-scrollbar overflow-x-hidden">
                                    {commentsLoading ? (
                                        <div className="flex flex-col gap-3">
                                            <CommentSkeleton size={8} />
                                        </div>
                                    ) : (
                                        commentsData?.items.map((comment: any) => (
                                            <React.Fragment key={comment.comment_id}>
                                                <CommentCard
                                                    comment={comment}
                                                    onReply={handleReplyName}
                                                />
                                                {comment.replies?.map((reply: any) => (
                                                    <CommentCard
                                                        key={reply.comment_id}
                                                        comment={reply}
                                                        reply
                                                        onReply={handleReplyName}
                                                    />
                                                ))}
                                            </React.Fragment>
                                        ))
                                    )}
                                    {commentsData?.items.length === 0 && (
                                        <div className="flex-center h-full w-full">
                                            <p className="text-md font-normal text-center">
                                                No comments yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="max-md:fixed absolute bottom-0 left-0 right-0 border-stroke bg-white px-7 py-4 border-t border-gray-100 z-50">
                            {replyTo.name && (
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-light">
                                        Replying to {replyTo.name}
                                    </p>
                                    <button
                                        type="button"
                                        aria-label="Cancel reply"
                                        onClick={handleReplyClose}
                                        className="cursor-pointer text-gray-light bg-transparent border-0 p-0"
                                    >
                                        <IoIosClose />
                                    </button>
                                </div>
                            )}
                            <CommentInput
                                onPost={() => handleComment(post?.post_id)}
                                name="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isCommentLoading}
                                loading={isCommentLoading}
                                onFocus={() => setIsCommentFocused(true)}
                                onBlur={() => setIsCommentFocused(false)}
                                inputClassName=""
                            />
                        </div>
                    </div>
                </div>
            )}
        </ViewModal>
        <ConfirmModal
            isOpen={!!deleteTargetId}
            title="Delete post"
            description="Are you sure you want to delete this post? This cannot be undone."
            confirmText="Delete"
            danger
            onConfirm={confirmDeletePost}
            onCancel={() => setDeleteTargetId(null)}
        />
        </>
    );
};

export default FeedViewModal;
