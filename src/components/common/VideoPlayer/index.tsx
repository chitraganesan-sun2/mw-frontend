"use client";

type VideoPlayerProps = {
    src: string;
    className?: string;
};

const VideoPlayer = ({ src, className }: VideoPlayerProps) => {
    return (
        <video src={src} controls preload="metadata" className={className}>
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoPlayer;
