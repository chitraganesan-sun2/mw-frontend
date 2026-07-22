"use client";

import Image from "next/image";
import VideoPlayer from "@/components/common/VideoPlayer";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import TagComponent from "@/components/common/Tag";
import { HeartLikeIcon, UnlikeHeartIcon } from "@/assets/icons";
import CommentIcon from "@/assets/icons/CommentIcon";
import { endpoints } from "@/api/constants";
import { DELETE_API, GET_API, POST_API } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommentInput from "../CommentInput";
import Cookies from "js-cookie";
import { callbackToast } from "@/components/common/Toast";
import MobileCommentPanel from "../MobileCommentPanel";
import SortDropdown from "../SortDropdown";
import { DeleteIcon, EditIcon } from "@/assets/icons";
import { getCurrentTab } from "@/constants/community";
import { useQueryState } from "nuqs";
import PostSkeleton from "./skeleton";
import { timesAgo } from "@/utils/timeFunctions";
import ReportIcon from "@/assets/icons/ReportIcon";
import ErrorMsg from "@/components/common/Messages/ErrorMsg";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BsFillBookmarkFill, BsBookmark } from "react-icons/bs";
import { useDebounce } from "use-debounce";
import ConfirmModal from "@/components/common/Modals/ConfirmModal";

interface FeedCardProps {
    onClick: (postId: string) => void;
    isManagePost?: boolean;
    handleReportClick?: (postId: string) => void;
}

interface Author {
    name: string;
    profile_picture: {
        image_url: string;
    };
}

interface PostData {
    post_id: string;
    description: string;
    author: Author;
    created_at: string;
    created_by: string;
    images: Array<{ image_url: string }>;
    video?: { video_url: string; video_id: string } | null;
    is_liked: boolean;
    is_saved: boolean;
    total_likes: number;
    total_comments: number;
}

const FeedCard = ({ onClick, isManagePost = false, handleReportClick }: FeedCardProps) => {
    const queryClient = useQueryClient();
    const role = Cookies.get("role");
    const [activeTab] = useQueryState("tab");
    const [searchQuery, setSearchQuery] = useQueryState("query");

    const [comment, setComment] = useState<string>("");
    const [isCommentLoading, setIsCommentLoading] = useState<boolean>(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

    const [mode, setMode] = useQueryState("mode");
    const [_, setId] = useQueryState("id");
    const { ref, inView } = useInView();
    const [selectedSort, setSelectedSort] = useState<string>("recent");
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

    const getPosts = async ({ pageParam = 1 }) => {
        let endpoint = endpoints.post.getPosts;

        switch (activeTab) {
            case "saved_posts":
                endpoint = endpoints.post.getSavedPosts;
                break;
            case "manage_your_posts":
                endpoint = endpoints.post.getMyPosts;
                break;
            // case "suggestion_posts":
            //     endpoint = endpoints.post.getSuggestionPosts;
            //     break;
            default:
                endpoint = endpoints.post.getPosts;
        }

        const response = await GET_API(`${endpoint}?page=${pageParam}&size=10&query=${debouncedSearchQuery || ""}`);
        return response.data;
    };

    const { data, fetchNextPage, hasNextPage, isLoading, isFetching, isFetchingNextPage, isError } =
        useInfiniteQuery({
            queryKey: ["get-posts", activeTab, debouncedSearchQuery],
            queryFn: getPosts,
            getNextPageParam: (lastPage) => {
                if (lastPage.items.length < 10) return undefined;
                return lastPage.page + 1;
            },
            initialPageParam: 1,
        });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

    const posts = data?.pages.flatMap((page) => page.items) ?? [];

    // Handle Like & DisLike
    const handleLikeAction = (postId: string, currentLikeStatus: boolean) => {
        queryClient.setQueryData(["get-posts", activeTab, searchQuery], (oldData: any) => {
            return {
                ...oldData,
                pages: oldData?.pages.map((page: any) => ({
                    ...page,
                    items: page.items.map((post: PostData) =>
                        post.post_id === postId
                            ? {
                                  ...post,
                                  is_liked: !currentLikeStatus,
                                  total_likes: currentLikeStatus
                                      ? post.total_likes - 1
                                      : post.total_likes + 1,
                              }
                            : post
                    ),
                })),
            };
        });

        if (!currentLikeStatus) {
            POST_API(endpoints.post.like(postId));
        } else {
            DELETE_API(endpoints.post.unlike(postId));
        }
    };

    // Handle Save
    const handleSave = (postId: string, currentSaveStatus: boolean) => {
        queryClient.setQueryData(["get-posts", activeTab, searchQuery], (oldData: any) => {
            return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                    ...page,
                    items: page.items.map((post: PostData) =>
                        post.post_id === postId
                            ? {
                                  ...post,
                                  is_saved: !currentSaveStatus,
                              }
                            : post
                    ),
                })),
            };
        });

        if (currentSaveStatus) {
            DELETE_API(endpoints.post.unsave(postId));
        } else {
            POST_API(endpoints.post.save(postId));
        }
    };

    // Handle Comment
    const handleComment = async (postId: string, parentId?: string) => {
        setIsCommentLoading(true);

        let payload = {
            comment_text: comment,
            created_by: role,
            post_id: postId,
            parent_id: "",
        };

        await callbackToast({
            apiCall: POST_API(endpoints.comment.createComment, payload),
            loadingMsg: "Posting Comment",
            successMsg: "Comment Posted Successfully",
            errorMsg: "Failed to Post Comment",
        }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["get-posts", activeTab, searchQuery] });
            setComment("");
            setIsCommentLoading(false);
        });
    };

    const toggleCommentPanel = (postId: string) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
        }
    };

    const handleCommentClick = (postId: string) => {
        if (window.innerWidth < 768) {
            toggleCommentPanel(postId);
        } else {
            onClick(postId);
        }
    };

    const handleSort = (value: string) => {
        setSelectedSort(value);
    };

    const handleEditClick = (postId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMode("edit");
        setId(postId);
    };

    const hanldeDeleteEvent = (postId: string) => {
        setDeleteTargetId(postId);
    };

    const confirmDeletePost = () => {
        if (!deleteTargetId) return;
        callbackToast({
            apiCall: DELETE_API(endpoints.post.deletePost(deleteTargetId)),
            loadingMsg: "Deleting Post",
            errorMsg: "Post not Deleted",
            successMsg: "Post Deleted",
        }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["get-posts", "manage_your_posts"] });
        });
        setDeleteTargetId(null);
    };

    if (isError) return <ErrorMsg />;

    return (
        <div className="flex flex-col gap-2 h-full md:p-0 relative">
            <h2 className="text-xl font-medium max-md:hidden">{getCurrentTab(activeTab)?.name}</h2>

            {/* {isManagePost && <SortDropdown selectedSort={selectedSort} onSort={handleSort} />} */}

            {isLoading ? (
                <PostSkeleton />
            ) : (
                <div className="flex flex-col gap-3 h-full divide-y divide-gray-200">
                    {posts.map((post) => {
                        const postImage = post?.images[0]?.image_url;
                        const validImageUrl = postImage && postImage.startsWith("http") ? postImage : "";

                        return(
                        <div key={post.post_id} className="block w-full relative py-2">
                            <div className="px-2 py-1 md:px-0">
                                {/* Profile and Name Section */}
                                <div className="flex items-start gap-2 md:gap-3 w-full p-2">
                                    <div className="w-[40px] h-[40px] md:w-[40px] md:h-[40px] relative flex-shrink-0 flex items-center justify-center">
                                        <Image
                                            src={
                                                post.author.profile_picture?.image_url ||
                                                DummyProfileImg
                                            }
                                            alt="profile picture"
                                            fill
                                            className="rounded-full object-cover"
                                            sizes="(max-width: 768px) 32px, 40px"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between w-full min-h-[32px] md:min-h-[40px]">
                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                                <p className="font-semibold text-sm md:text-base text-black">
                                                    {post?.author?.name}
                                                </p>
                                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-black"></div>
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    {isManagePost || (
                                                        <div className="flex items-center">
                                                            <TagComponent
                                                                text={post?.created_by}
                                                                className="w-fit text-xs md:text-sm"
                                                            />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                                        </div>
                                                    )}
                                                    <p className="font-semibold text-sm md:text-base text-black">
                                                        {timesAgo(post?.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isManagePost ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            aria-label="Edit post"
                                                            onClick={(e) =>
                                                                handleEditClick(post.post_id, e)
                                                            }
                                                            className="cursor-pointer bg-transparent border-0 p-0"
                                                        >
                                                            <EditIcon width={40} height={40} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label="Delete post"
                                                            onClick={() => hanldeDeleteEvent(post?.post_id)}
                                                            className="cursor-pointer bg-transparent border-0 p-0"
                                                        >
                                                            <DeleteIcon width={40} height={40} />
                                                        </button>
                                                        {/* <div
                                                            onClick={() => {}}
                                                            className="cursor-pointer hidden md:block"
                                                        >
                                                            <MenuDot />
                                                        </div> */}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        aria-label="Report post"
                                                        onClick={() => handleReportClick?.(post?.post_id)}
                                                        className="cursor-pointer border rounded-full bg-transparent"
                                                    >
                                                        <ReportIcon />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post Content Section */}
                            <div className="mt-0 md:mt-3 lg:mt-0 lg:!pl-[50px]">
                                <div className="px-3 md:px-0">
                                    <p className="text-xs md:text-sm font-normal">
                                        {post.description}
                                        {post.description.length > 150 && (
                                            <button
                                                type="button"
                                                onClick={() => onClick(post.post_id)}
                                                className="cursor-pointer text-primary font-medium text-[#ffac71] bg-transparent border-0 p-0 inline"
                                            >
                                                See More
                                            </button>
                                        )}
                                    </p>
                                </div>

                                {post.images.length > 0 && (
                                    <div className="relative mt-2 md:mt-3 w-full h-full bg-gray-300 sm:rounded-xl min-h-[260px] max-h-[350px] sm:min-h-[300px] md:min-h-[360px] md:max-h-[420px] 2xl:min-h-[400px] 2xl:max-h-[450px]">
                                        <Image
                                            src={validImageUrl}
                                            alt="post image"
                                            fill
                                            onClick={() => onClick(post.post_id)}
                                            className="object-contain cursor-pointer md:rounded-xl"
                                        />
                                        {post?.images?.length > 1 && (
                                            <button onClick={() => onClick(post?.post_id)} className="absolute text-sm h-[30px] w-[30px] bottom-[10px] right-[10px] bg-white rounded-full flex-center">+{post?.images?.length - 1}</button>
                                        )}
                                    </div>
                                )}

                                {post.images.length === 0 && post.video?.video_url && (
                                    <div className="relative mt-2 md:mt-3 w-full sm:rounded-xl min-h-[260px] max-h-[350px] sm:min-h-[300px] md:min-h-[360px] md:max-h-[420px] 2xl:min-h-[400px] 2xl:max-h-[450px]">
                                        <VideoPlayer src={post.video.video_url} className="w-full h-full max-h-[420px] sm:rounded-xl" />
                                    </div>
                                )}

                                <div className="p-2 md:pr-4 md:px-0 mt-2 md:mt-3">
                                    <div className="flex justify-between items-center gap-2">
                                        <div className="flex items-center gap-6">
                                            {/* Like button section */}
                                            <button
                                                type="button"
                                                aria-label={post.is_liked ? "Unlike post" : "Like post"}
                                                onClick={() => handleLikeAction(post.post_id, post.is_liked)}
                                                className="flex items-center gap-1 cursor-pointer w-10 bg-transparent border-0 p-0"
                                            >
                                                <div>
                                                    <AnimatePresence mode="wait">
                                                        {post.is_liked ? (
                                                            <motion.div
                                                                key="liked"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                    ease: "easeInOut",
                                                                }}
                                                            >
                                                                <HeartLikeIcon />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="unliked"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                    ease: "easeInOut",
                                                                }}
                                                            >
                                                                <UnlikeHeartIcon />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <motion.p
                                                    className="font-medium"
                                                    animate={{
                                                        scale: post.is_liked ? [1, 1.2, 1] : 1,
                                                        color: post.is_liked ? "#EF4444" : "black",
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {post?.total_likes}
                                                </motion.p>
                                            </button>
                                            {/* Comment button section */}
                                            <button
                                                type="button"
                                                aria-label="View comments"
                                                onClick={() => handleCommentClick(post.post_id)}
                                                className="flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <CommentIcon />
                                                </motion.div>
                                                <motion.p
                                                    className="font-medium text-black"
                                                    initial={{ scale: 1 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    animate={{
                                                        scale:
                                                            post.total_comments > 0
                                                                ? [1, 1.1, 1]
                                                                : 1,
                                                        opacity: post.total_comments > 0 ? 1 : 0.7,
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {post.total_comments}
                                                </motion.p>
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label={post?.is_saved ? "Unsave post" : "Save post"}
                                            className="cursor-pointer bg-transparent border-0 p-0"
                                            onClick={() =>
                                                handleSave(post?.post_id, post?.is_saved)
                                            }
                                        >
                                            {post?.is_saved ? (
                                                <BsFillBookmarkFill size={24} />
                                            ) : (
                                                <BsBookmark size={24} />
                                            )}
                                        </button>
                                    </div>
                                    {/* Only show comment input on desktop */}
                                    <div className="hidden md:block mt-4">
                                        <CommentInput
                                            name="comment"
                                            value={comment || ""}
                                            onChange={(e) => setComment(e.target.value)}
                                            disabled={isCommentLoading}
                                            inputClassName=""
                                            onPost={() => handleComment(post.post_id)}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    )})}

                    {/* Loading indicator */}
                    {posts.length !== 0 && (
                        <div ref={ref} className="w-full">
                            {isFetchingNextPage ? (
                                <PostSkeleton size={2} />
                            ) : (
                                <div className="w-full text-center font-semibold text-success mt-4 px-5">
                                    You’ve reached the end. No more posts to show!
                                </div>
                            )}
                        </div>
                    )}

                    {posts.length === 0 && (
                        <div className="flex-center w-full h-full min-h-[50vh] flex-col gap-1">
                            <p>No Posts Found</p>
                            {searchQuery && (
                                <button className="text-blue-500 underline" onClick={() => setSearchQuery(null)}>Clear Search</button>
                            ) }
                        </div>
                    )}

                    <AnimatePresence>
                        {activeCommentPostId && (
                            <MobileCommentPanel
                                postId={activeCommentPostId}
                                comment={comment}
                                setComment={setComment}
                                onClose={() => setActiveCommentPostId(null)}
                                handleComment={handleComment}
                            />
                        )}
                    </AnimatePresence>

                </div>
            )}
            <ConfirmModal
                isOpen={!!deleteTargetId}
                title="Delete post"
                description="Are you sure you want to delete this post? This cannot be undone."
                confirmText="Delete"
                danger
                onConfirm={confirmDeletePost}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
};

export default FeedCard;
