"use client";

type VideoPlayerProps = {
    src: string;
    className?: string;
};

const VideoPlayer = ({ src, className }: VideoPlayerProps) => {
    return (
        <video src={src} controls preload="metadata" className={className}>
            Your browser can&apos;t play this video.
        </video>
    );
};

export default VideoPlayer;
