import React, { useState } from "react";
import Image from "next/image";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import TagComponent from "@/components/common/Tag";
import { HeartLikeIcon, UnlikeHeartIcon } from "@/assets/icons";
import { DELETE_API, POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { timesAgo } from "@/utils/timeFunctions";

const CommentCard: React.FC<CommentCardProps> = ({ reply, comment, onReply }) => {
    const queryClient = useQueryClient();
    const [isLiked, setIsLiked] = useState(comment?.is_liked || false);
    const [likesCount, setLikesCount] = useState(comment?.total_likes || 0);

    // If no comment data is provided, return null or a placeholder
    if (!comment) return null;

    const handleCommentLikes = async () => {
        const newLikeStatus = !isLiked;
        setIsLiked(newLikeStatus);
        setLikesCount((prev) => (newLikeStatus ? prev + 1 : prev - 1));

        try {
            if (newLikeStatus) {
                await POST_API(endpoints.comment.commentLikes(comment.comment_id));
            } else {
                await DELETE_API(endpoints.comment.commentLikes(comment.comment_id));
            }
            queryClient.invalidateQueries({ queryKey: ["get-post-comments"] });
        } catch (err) {
            console.log(err, "ERROR FOR LIKE");
            // Revert on error
            setIsLiked(!newLikeStatus);
            setLikesCount((prev) => (!newLikeStatus ? prev + 1 : prev - 1));
        }
    };

    // Format the date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return `${diffDays}d`;
    };

    const handleReply = (comment: any) => {
        console.log(comment, "COMMENT DATA");
        const replyId = reply ? comment.parent_comment_id : comment.comment_id;
        onReply(comment.author.name, replyId);
    };

    return (
        <div className={`${reply ? "ml-9" : ""}`}>
            <div className="flex justify-between gap-2">
                <div className="flex gap-1">
                    <div className="w-[32px] h-[32px] relative flex-shrink-0">
                        <Image
                            src={comment.author.profile_picture.image_url || DummyProfileImg}
                            alt="profile picture"
                            fill
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className="ml-1 flex-1 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2 w-full">
                            <p className="font-semibold text-black text-sm">
                                {comment.author.name}
                            </p>
                            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                            <div className="flex items-center gap-2">
                                <TagComponent
                                    text={comment.created_by}
                                    className="w-fit text-[12px] capitalize !m-0"
                                    tagClassName={`!border-none ${comment?.created_by === "volunteer" ? "!bg-[#FFE9D4]" : "!bg-[#DFF5FF]"}`}
                                />
                                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                <p className="font-semibold text-black text-sm">
                                    {timesAgo(comment.created_at)}
                                </p>
                            </div>
                        </div>
                        <p className="text-[12px] font-normal break-word">{comment.comment_text}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <button
                        type="button"
                        aria-label={isLiked ? "Unlike comment" : "Like comment"}
                        onClick={handleCommentLikes}
                        className="cursor-pointer scale-75 bg-transparent border-0 p-0"
                    >
                        <AnimatePresence mode="wait">
                            {isLiked ? (
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
                                    <HeartLikeIcon className="w-7 h-7" />
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
                                    <UnlikeHeartIcon className="w-7 h-7" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                    <motion.p
                        className="text-[12px] font-medium text-[#EF4444]"
                        animate={{
                            scale: isLiked ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {likesCount > 0 && likesCount}
                    </motion.p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-[36px] h-[32px]"></div>
                <button
                    type="button"
                    onClick={() => handleReply(comment)}
                    className="text-sm font-medium text-gray-light cursor-pointer bg-transparent border-0 p-0"
                >
                    Reply
                </button>
            </div>
        </div>
    );
};

export default CommentCard;
