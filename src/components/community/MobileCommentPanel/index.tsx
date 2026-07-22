import { motion } from "framer-motion";
import CommentCard from "../CommentCard";
import CommentInput from "../CommentInput";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import React, { useState } from "react";
import CommentSkeleton from "../CommentCard/skeleton";
import { IoIosClose } from "react-icons/io";

interface MobileCommentPanelProps {
    postId: string;
    totalComments?: number;
    comment: string;
    setComment: (value: string) => void;
    onClose: () => void;
    handleComment: (postId: string, parentId?: string) => void;
}

const MobileCommentPanel = ({
    postId,
    totalComments,
    comment,
    setComment,
    onClose,
    handleComment,
}: MobileCommentPanelProps) => {
    const [replyTo, setReplyTo] = useState({
        name: "",
        id: "",
    });

    const getPostComments = async () => {
        const response = await GET_API(endpoints.comment.getPostComments(postId as string));
        return response.data;
    };

    const {
        data: commentsData,
        isLoading: commentsLoading,
        refetch: refetchComments,
    } = useQuery({
        queryKey: ["get-post-comments", postId],
        queryFn: getPostComments,
        enabled: !!postId,
    });

    const handleReplyName = (name: string, id: string) => {
        setReplyTo({ name, id });
    };

    const handleReplyClose = () => {
        setReplyTo({ name: "", id: "" });
    };

    const handleSubmitComment = () => {
        handleComment(postId, replyTo?.id);
        setReplyTo({ name: "", id: "" });
        setComment("");
        refetchComments();
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="fixed bottom-0 left-0 right-0 bg-white z-50 h-[98dvh] md:hidden overflow-hidden rounded-t-[20px] shadow-lg flex flex-col"
        >
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comments {totalComments && `(${totalComments})` } </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        Close
                    </button>
                </div>
            </div>

            {/* Scrollable Comments Area */}

            <div className="flex-1 flex-col gap-3 overflow-y-auto hide-scrollbar px-5 py-4">
                {commentsLoading ? (
                    <div className="flex flex-col gap-3">
                        <CommentSkeleton size={8} />
                    </div>
                ) : (
                    commentsData?.items.map((comment: any) => (
                        <React.Fragment key={comment.comment_id}>
                            <CommentCard comment={comment} onReply={handleReplyName} />
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
                        <p className="text-md font-normal text-center">No comments yet</p>
                    </div>
                )}
            </div>

            {/* Fixed Comment Input at Bottom */}
            <div className="sticky bottom-0 bg-white border-t p-4">
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
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={false}
                    inputClassName="w-full"
                    onPost={handleSubmitComment}
                />
            </div>
        </motion.div>
    );
};

export default MobileCommentPanel;