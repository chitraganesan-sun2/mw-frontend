"use client";

import React from "react";
import InstantSessions from "../InstantSessions";
import WingTime from "../WingTime";

/**
 * SessionOptions component displays both Instant Sessions and Wing Time
 * side by side in a responsive 2-column layout on the landing page.
 * 
 * - Desktop/Laptop: 2 columns side by side
 * - Tablet: 2 columns with adjusted spacing
 * - Mobile: Stacks vertically
 */
const SessionOptions = () => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-[1400px] w-full mx-auto">
                {/* Instant Sessions - Left Column */}
                <div className="reveal min-w-0">
                    <InstantSessions />
                </div>
                
                {/* Wing Time - Right Column */}
                <div className="reveal min-w-0">
                    <WingTime />
                </div>
            </div>
        </div>
    );
};

export default SessionOptions;
